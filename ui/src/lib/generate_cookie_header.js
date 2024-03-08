const generate_cookie_header = (query_parameters = {}) => {
  return Object.entries(query_parameters).map(([key, value]) => {
    return `${key}=${value}`;
  })?.join('; ');
};

export default generate_cookie_header;
