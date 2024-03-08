const serialize_query_parameters = (query_parameters = {}) => {
  return Object.entries(query_parameters).map(([key, value]) => {
    return `${key}=${value}`;
  })?.join('&');
};

export default serialize_query_parameters;
