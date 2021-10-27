var isArrayPath_default = (path = "") => {
  return new RegExp(/\.[0-9]+\.?/g).test(path);
};
export {
  isArrayPath_default as default
};
