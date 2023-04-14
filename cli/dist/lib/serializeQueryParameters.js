var serializeQueryParameters_default = (queryParameters = {}) => {
  return Object.entries(queryParameters).map(([key, value]) => {
    return `${key}=${value}`;
  })?.join("&");
};
export {
  serializeQueryParameters_default as default
};
