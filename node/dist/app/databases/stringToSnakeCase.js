var stringToSnakeCase_default = (string = "") => {
  return string?.split(/\.?(?=[A-Z])/).join("_").toLowerCase();
};
export {
  stringToSnakeCase_default as default
};
