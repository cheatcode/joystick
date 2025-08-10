import get_target_database_connection from "../app/databases/get_target_database_connection.js";
import generate_id from "../lib/generate_id.js";

const cache = (cache_name = '') => {
  const cache_connection = get_target_database_connection('cache');
  const use_redis = cache_connection?.provider === 'redis';
  
  if (use_redis) {
    return redis_cache_adapter(cache_name, cache_connection.connection);
  }
  
  return in_memory_cache_adapter(cache_name);
};

const in_memory_cache_adapter = (cache_name) => {
  return {
    add: (cache_item = {}) => {
      process.caches[cache_name] = [
        ...(process.caches[cache_name] || []),
        cache_item,
      ];
    },
    find: (query_array = null) => {
      return query_array ? process.caches[cache_name]?.filter((cache_item) => {
        return cache_item[query_array[0]] === query_array[1];
      }) : process.caches[cache_name];
    },
    find_one: (query_array = null) => {
      return query_array ? process.caches[cache_name]?.find((cache_item) => {
        return cache_item[query_array[0]] === query_array[1];
      }) : null;
    },
    set: (cache_array = []) => {
      process.caches[cache_name] = cache_array;
    },
    update: ([key_to_match = '', value_to_match = ''], replacement_item = {}) => {
      const index_to_update = process.caches[cache_name]?.findIndex((cache_item = {}) => {
        return cache_item[key_to_match] === value_to_match;
      });
      if (typeof index_to_update === 'number') {
        process.caches[cache_name][index_to_update] = {
          ...(process.caches[cache_name][index_to_update] || {}),
          ...replacement_item,
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

const redis_cache_adapter = (cache_name, redis_connection) => {
  const cache_key = `cache:${cache_name}`;
  
  return {
    add: async (cache_item = {}) => {
      // Add unique ID if not present for Redis key management
      if (!cache_item._cache_id) {
        cache_item._cache_id = generate_id(16);
      }
      
      const item_key = `${cache_key}:${cache_item._cache_id}`;
      await redis_connection.hset(item_key, 'data', JSON.stringify(cache_item));
      
      // Add to cache index for efficient querying
      await redis_connection.sadd(`${cache_key}:index`, cache_item._cache_id);
      
      // Create field indexes for efficient querying
      for (const [field, value] of Object.entries(cache_item)) {
        if (field !== '_cache_id') {
          await redis_connection.sadd(`${cache_key}:field:${field}:${value}`, cache_item._cache_id);
        }
      }
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
        const item_data = await redis_connection.hget(`${cache_key}:${matching_ids[0]}`, 'data');
        return item_data ? JSON.parse(item_data) : null;
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
        const field_keys = await redis_connection.keys(`${cache_key}:field:*`);
        for (const field_key of field_keys) {
          multi.del(field_key);
        }
        
        multi.del(`${cache_key}:index`);
        await multi.exec();
      }
      
      // Add new items
      for (const cache_item of cache_array) {
        await redis_cache_adapter(cache_name, redis_connection).add(cache_item);
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
          
          // Update item data
          await redis_connection.hset(item_key, 'data', JSON.stringify(updated_item));
          
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
        const item_key = `${cache_key}:${item_id}`;
        const item_data = await redis_connection.hget(item_key, 'data');
        
        if (item_data) {
          const item = JSON.parse(item_data);
          
          // Remove from all field indexes
          for (const [field, value] of Object.entries(item)) {
            if (field !== '_cache_id') {
              await redis_connection.srem(`${cache_key}:field:${field}:${value}`, item_id);
            }
          }
          
          // Remove item and from main index
          await redis_connection.del(item_key);
          await redis_connection.srem(`${cache_key}:index`, item_id);
        }
      }
    },
  };
};

export default cache;
