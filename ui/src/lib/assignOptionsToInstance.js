export default (options = {}, instance = {}) => {
  Object.entries(options).forEach(([key, value]) => {
    instance[key] = value;
  });
};