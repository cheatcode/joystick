export default (queryParameters = {}) => {
  return Object.entries(queryParameters || {}).map(([key, value]) => {
    return `${key}=${value}`;
  })?.join('&');
};