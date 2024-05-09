const cache = (cache_name = '') => {
  return {
    add: (cache_item = {}) => {
      process.caches[cache_name] = [
        ...(process.caches[cache_name] || []),
        cache_item,
      ];
    },
    get: ([key = '', value = '']) => {
      return process.caches[cache_name]?.find((cache_item) => {
        return cache_item[key] === value;
      });
    },
    set: (cache_array = []) => {
      process.caches[cache_name] = cache_array;
    },
    update: ([key_to_match = '', value_to_match = ''], replacement_item = {}) => {
      // NOTE: Find the item to update.
      let item_to_update_in_cache = process.caches[cache_name]?.find((cache_item) => {
        return cache_item[key_to_match] = value_to_match;
      });

      if (item_to_update_in_cache) {
        // NOTE: If we find a match, remove the original from the cache.
        process.caches[cache_name] = (process.caches[cache_name] || [])?.filter((cache_item = {}) => {
          if (!cache_item[key_to_match]) {
            return true;
          }

          return cache_item[key_to_match] !== value_to_match;
        });

        // NOTE: Make the patches to the matched item.
        item_to_update_in_cache = {
          ...(item_to_update_in_cache || {}),
          ...(replacement_item || {}),
        };

        // NOTE: Add the patched item back to the cache.
        process.caches[cache_name] = [
          ...(process.caches[cache_name] || []),
          item_to_update_in_cache,
        ];
      }
    },
  };
};

export default cache;