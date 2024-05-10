const cache = (cache_name = '') => {
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

      if (index_to_update) {
        process.caches[cache_name][index_to_update] = {
          ...(process.caches[cache_name][index_to_update] || {}),
          ...replacement_item,
        };
      }

      // NOTE: Find the item to update.
      // let item_to_update_in_cache = process.caches[cache_name]?.find((cache_item) => {
      //   return cache_item[key_to_match] = value_to_match;
      // });

      // if (item_to_update_in_cache) {
      //   // NOTE: If we find a match, remove the original from the cache.
      //   process.caches[cache_name] = (process.caches[cache_name] || [])?.filter((cache_item = {}) => {
      //     if (!cache_item[key_to_match]) {
      //       return true;
      //     }

      //     return cache_item[key_to_match] !== value_to_match;
      //   });

      //   // NOTE: Make the patches to the matched item.
      //   item_to_update_in_cache = {
      //     ...(item_to_update_in_cache || {}),
      //     ...(replacement_item || {}),
      //   };

      //   // NOTE: Add the patched item back to the cache.
      //   process.caches[cache_name] = [
      //     ...(process.caches[cache_name] || []),
      //     item_to_update_in_cache,
      //   ];
      // }
    },
  };
};

export default cache;