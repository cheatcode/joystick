const cache = (cache_name = '') => {
  if (!process.caches) {
    process.caches = {};
  }

  if (!process.caches[cache_name]) {
    process.caches[cache_name] = new Map();
  }

  return {
    add: (cache_item = {}) => {
      const id = crypto.randomUUID();
      process.caches[cache_name].set(id, cache_item);
    },

    find: (query_array = null) => {
      const entries = Array.from(process.caches[cache_name].values());

      if (!query_array) {
        return entries;
      }

      return entries.filter((item) => item[query_array[0]] === query_array[1]);
    },

    find_one: (query_array = null) => {
      if (!query_array) {
        return null;
      }

      for (const item of process.caches[cache_name].values()) {
        if (item[query_array[0]] === query_array[1]) {
          return item;
        }
      }

      return null;
    },

    set: (cache_array = []) => {
      const map = new Map();
      for (const item of cache_array) {
        const id = crypto.randomUUID();
        map.set(id, item);
      }
      process.caches[cache_name] = map;
    },

    update: ([key_to_match = '', value_to_match = ''], replacement_item = {}) => {
      for (const [id, item] of process.caches[cache_name].entries()) {
        if (item[key_to_match] === value_to_match) {
          process.caches[cache_name].set(id, {
            ...item,
            ...replacement_item,
          });
          break;
        }
      }
    },

    remove: ([key_to_match = '', value_to_match = '']) => {
      for (const [id, item] of process.caches[cache_name].entries()) {
        if (item[key_to_match] === value_to_match) {
          process.caches[cache_name].delete(id);
        }
      }
    },
  };
};

export default cache;
