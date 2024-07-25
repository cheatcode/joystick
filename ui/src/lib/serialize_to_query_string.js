const serialize_to_query_string = (object_to_serialize) => {
  return Object.keys(object_to_serialize)
    .map(key => {
      const value = object_to_serialize[key];
      
      if (value === null || value === undefined) {
        return encodeURIComponent(key);
      }

      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join('&');
};

export default serialize_to_query_string;