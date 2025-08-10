import get_target_database_connection from "../app/databases/get_target_database_connection.js";
import generate_id from "../lib/generate_id.js";

const cache = (cache_name = '', options = {}) => {
  const cache_options = {
    ttl: null, // Time to live in seconds
    max_items: null, // Maximum number of items (LRU)
    ...options
  };
  
  const cache_connection = get_target_database_connection('cache');
  const use_redis = cache_connection?.provider === 'redis';
  
  if (use_redis) {
    return redis_cache_adapter(cache_name, cache_connection.connection, cache_options);
  }
  
  return in_memory_cache_adapter(cache_name, cache_options);
};

const in_memory_cache_adapter = (cache_name, options = {}) => {
  const { ttl, max_items } = options;
  
  const add_cache_metadata = (cache_item) => {
    const now = Date.now();
    return {
      ...cache_item,
      _cache_created_at: now,
      _cache_accessed_at: now,
    };
  };
  
  const clean_expired_items = () => {
    if (!ttl || !process.caches[cache_name]) return;
    
    const now = Date.now();
    const ttl_ms = ttl * 1000;
    
    process.caches[cache_name] = process.caches[cache_name].filter((item) => {
      return (now - item._cache_created_at) < ttl_ms;
    });
  };
  
  const enforce_max_items = () => {
    if (!max_items || !process.caches[cache_name]) return;
    
    if (process.caches[cache_name].length > max_items) {
      // Sort by last accessed time (LRU) and remove oldest
      process.caches[cache_name].sort((a, b) => b._cache_accessed_at - a._cache_accessed_at);
      process.caches[cache_name] = process.caches[cache_name].slice(0, max_items);
    }
  };
  
  const update_access_time = (cache_item) => {
    cache_item._cache_accessed_at = Date.now();
    return cache_item;
  };
  
  return {
    add: (cache_item = {}) => {
      clean_expired_items();
      
      const item_with_metadata = add_cache_metadata(cache_item);
      process.caches[cache_name] = [
        ...(process.caches[cache_name] || []),
        item_with_metadata,
      ];
      
      enforce_max_items();
    },
    
    find: (query_array = null) => {
      clean_expired_items();
      
      const items = query_array ? 
        process.caches[cache_name]?.filter((cache_item) => {
          return cache_item[query_array[0]] === query_array[1];
        }) : 
        process.caches[cache_name];
      
      // Update access times for found items
      return items?.map(update_access_time) || [];
    },
    
    find_one: (query_array = null) => {
      clean_expired_items();
      
      const item = query_array ? 
        process.caches[cache_name]?.find((cache_item) => {
          return cache_item[query_array[0]] === query_array[1];
        }) : 
        null;
      
      return item ? update_access_time(item) : null;
    },
    
    set: (cache_array = []) => {
      const items_with_metadata = cache_array.map(add_cache_metadata);
      process.caches[cache_name] = items_with_metadata;
      enforce_max_items();
    },
    
    update: ([key_to_match = '', value_to_match = ''], replacement_item = {}) => {
      clean_expired_items();
      
      const index_to_update = process.caches[cache_name]?.findIndex((cache_item = {}) => {
        return cache_item[key_to_match] === value_to_match;
      });
      
      if (typeof index_to_update === 'number') {
        process.caches[cache_name][index_to_update] = {
          ...(process.caches[cache_name][index_to_update] || {}),
          ...replacement_item,
          _cache_accessed_at: Date.now(),
        };
      }
    },
    
    remove: ([key_to_match = '', value_to_match = '']) => {
      if (process.caches[cache_name]) {
        process.caches[cache_name] = process.caches[cache_name].filter((cache_item = {}) => {
          return cache_item[key_to_match] !== value_to_match;
        });
      }
    },
  };
};

const redis_cache_adapter = (cache_name, redis_connection, options = {}) => {
  const { ttl, max_items } = options;
  const cache_key = `cache:${cache_name}`;
  const lru_key = `${cache_key}:lru`;
  
  // Start cleanup process if TTL is enabled
  if (ttl) {
    const cleanup_interval = Math.min(ttl * 1000, 30000); // Cleanup every TTL seconds or 30s max
    setInterval(async () => {
      await cleanup_expired_items();
    }, cleanup_interval);
  }
  
  const cleanup_expired_items = async () => {
    if (!ttl) return;
    
    try {
      // Get all item IDs from main index
      const all_item_ids = await redis_connection.smembers(`${cache_key}:index`);
      
      for (const item_id of all_item_ids) {
        const item_key = `${cache_key}:${item_id}`;
        const exists = await redis_connection.exists(item_key);
        
        if (!exists) {
          // Item has expired, clean up all references
          await remove_item_completely(item_id);
        }
      }
    } catch (error) {
      console.warn(`Cache cleanup error for ${cache_name}:`, error);
    }
  };
  
  const enforce_max_items = async () => {
    if (!max_items) return;
    
    const current_count = await redis_connection.scard(`${cache_key}:index`);
    
    if (current_count > max_items) {
      // Get least recently used items
      const items_to_remove = current_count - max_items;
      const lru_items = await redis_connection.zrange(lru_key, 0, items_to_remove - 1);
      
      // Remove LRU items
      for (const item_id of lru_items) {
        await remove_item_completely(item_id);
      }
    }
  };
  
  const update_lru_score = async (item_id) => {
    if (!max_items) return;
    
    // Update LRU score with current timestamp
    await redis_connection.zadd(lru_key, { score: Date.now(), value: item_id });
  };
  
  const remove_item_completely = async (item_id) => {
    const item_key = `${cache_key}:${item_id}`;
    const item_data = await redis_connection.hget(item_key, 'data');
    
    if (item_data) {
      const item = JSON.parse(item_data);
      
      // Remove from all field indexes
      for (const [field, value] of Object.entries(item)) {
        if (field !== '_cache_id') {
          await redis_connection.srem(`${cache_key}:field:${field}:${value}`, item_id);
          
          // Clean up empty field index sets
          const remaining_items = await redis_connection.scard(`${cache_key}:field:${field}:${value}`);
          if (remaining_items === 0) {
            await redis_connection.del(`${cache_key}:field:${field}:${value}`);
          }
        }
      }
    } else {
      // Item data is gone (expired), need to find and clean up field indexes manually
      const field_pattern = `${cache_key}:field:*`;
      const field_keys = await redis_connection.client.keys(field_pattern);
      
      for (const field_key of field_keys) {
        // Check if this field index contains the expired item
        const is_member = await redis_connection.sismember(field_key, item_id);
        if (is_member) {
          await redis_connection.srem(field_key, item_id);
          
          // Clean up empty field index sets
          const remaining_items = await redis_connection.scard(field_key);
          if (remaining_items === 0) {
            await redis_connection.del(field_key);
          }
        }
      }
    }
    
    // Remove item, from main index, and from LRU tracking
    await redis_connection.del(item_key);
    await redis_connection.srem(`${cache_key}:index`, item_id);
    await redis_connection.zrem(lru_key, item_id);
  };
  
  return {
    add: async (cache_item = {}) => {
      // Add unique ID if not present for Redis key management
      if (!cache_item._cache_id) {
        cache_item._cache_id = generate_id(16);
      }
      
      const item_key = `${cache_key}:${cache_item._cache_id}`;
      
      // Set item data
      await redis_connection.hset(item_key, 'data', JSON.stringify(cache_item));
      
      // Add to cache index for efficient querying
      await redis_connection.sadd(`${cache_key}:index`, cache_item._cache_id);
      
      // Update LRU tracking
      await update_lru_score(cache_item._cache_id);
      
      // Create field indexes for efficient querying
      for (const [field, value] of Object.entries(cache_item)) {
        if (field !== '_cache_id') {
          await redis_connection.sadd(`${cache_key}:field:${field}:${value}`, cache_item._cache_id);
        }
      }
      
      // Set TTL only on the item itself - indexes will be cleaned up by cleanup process
      if (ttl) {
        await redis_connection.expire(item_key, ttl);
      }
      
      // Enforce max items limit
      await enforce_max_items();
    },
    
    find: async (query_array = null) => {
      if (!query_array) {
        // Return all items
        const item_ids = await redis_connection.smembers(`${cache_key}:index`);
        const items = [];
        
        for (const item_id of item_ids) {
          const item_data = await redis_connection.hget(`${cache_key}:${item_id}`, 'data');
          if (item_data) {
            items.push(JSON.parse(item_data));
            await update_lru_score(item_id);
          } else {
            // Clean up orphaned index entry
            await redis_connection.srem(`${cache_key}:index`, item_id);
            await redis_connection.zrem(lru_key, item_id);
          }
        }
        
        return items;
      }
      
      // Query by field value
      const [field, value] = query_array;
      const matching_ids = await redis_connection.smembers(`${cache_key}:field:${field}:${value}`);
      const items = [];
      
      for (const item_id of matching_ids) {
        const item_data = await redis_connection.hget(`${cache_key}:${item_id}`, 'data');
        if (item_data) {
          items.push(JSON.parse(item_data));
          await update_lru_score(item_id);
        } else {
          // Clean up orphaned field index entry
          await redis_connection.srem(`${cache_key}:field:${field}:${value}`, item_id);
          await redis_connection.srem(`${cache_key}:index`, item_id);
          await redis_connection.zrem(lru_key, item_id);
        }
      }
      
      return items;
    },
    
    find_one: async (query_array = null) => {
      if (!query_array) {
        return null;
      }
      
      const [field, value] = query_array;
      const matching_ids = await redis_connection.smembers(`${cache_key}:field:${field}:${value}`);
      
      if (matching_ids.length > 0) {
        const item_id = matching_ids[0];
        const item_data = await redis_connection.hget(`${cache_key}:${item_id}`, 'data');
        
        if (item_data) {
          await update_lru_score(item_id);
          return JSON.parse(item_data);
        } else {
          // Clean up orphaned field index entry
          await redis_connection.srem(`${cache_key}:field:${field}:${value}`, item_id);
          await redis_connection.srem(`${cache_key}:index`, item_id);
          await redis_connection.zrem(lru_key, item_id);
        }
      }
      
      return null;
    },
    
    set: async (cache_array = []) => {
      // Clear existing cache
      const existing_ids = await redis_connection.smembers(`${cache_key}:index`);
      
      if (existing_ids.length > 0) {
        // Remove all existing items and indexes
        const multi = redis_connection.client.multi();
        
        for (const item_id of existing_ids) {
          multi.del(`${cache_key}:${item_id}`);
        }
        
        // Clear all field indexes
        const field_keys = await redis_connection.client.keys(`${cache_key}:field:*`);
        for (const field_key of field_keys) {
          multi.del(field_key);
        }
        
        multi.del(`${cache_key}:index`);
        multi.del(lru_key);
        await multi.exec();
      }
      
      // Add new items
      for (const cache_item of cache_array) {
        await redis_cache_adapter(cache_name, redis_connection, options).add(cache_item);
      }
    },
    
    update: async ([key_to_match = '', value_to_match = ''], replacement_item = {}) => {
      const matching_ids = await redis_connection.smembers(`${cache_key}:field:${key_to_match}:${value_to_match}`);
      
      if (matching_ids.length > 0) {
        const item_id = matching_ids[0];
        const item_key = `${cache_key}:${item_id}`;
        const existing_data = await redis_connection.hget(item_key, 'data');
        
        if (existing_data) {
          const existing_item = JSON.parse(existing_data);
          const updated_item = { ...existing_item, ...replacement_item };
          
          // Remove old field indexes
          for (const [field, value] of Object.entries(existing_item)) {
            if (field !== '_cache_id') {
              await redis_connection.srem(`${cache_key}:field:${field}:${value}`, item_id);
            }
          }
          
          // Update item data with TTL if specified
          if (ttl) {
            await redis_connection.hset(item_key, 'data', JSON.stringify(updated_item));
            await redis_connection.expire(item_key, ttl);
          } else {
            await redis_connection.hset(item_key, 'data', JSON.stringify(updated_item));
          }
          
          // Update LRU tracking
          await update_lru_score(item_id);
          
          // Add new field indexes
          for (const [field, value] of Object.entries(updated_item)) {
            if (field !== '_cache_id') {
              await redis_connection.sadd(`${cache_key}:field:${field}:${value}`, item_id);
            }
          }
        }
      }
    },
    
    remove: async ([key_to_match = '', value_to_match = '']) => {
      const matching_ids = await redis_connection.smembers(`${cache_key}:field:${key_to_match}:${value_to_match}`);
      
      for (const item_id of matching_ids) {
        await remove_item_completely(item_id);
      }
    },
  };
};

export default cache;
