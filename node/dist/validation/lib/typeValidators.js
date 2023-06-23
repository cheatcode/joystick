const isAny = (value) => {
  return !!value;
};
const isFunction = (value) => {
  return typeof value === "function";
};
const isObject = (value) => {
  return !!(value && typeof value === "object" && !Array.isArray(value));
};
const isArray = (value) => {
  return !!Array.isArray(value);
};
const isBoolean = (value) => {
  return value === true || value === false;
};
const isFloat = (value) => {
  return Number(value) === value && value % 1 !== 0;
};
const isInteger = (value) => {
  return Number(value) === value && value % 1 === 0;
};
const isNumber = (value) => {
  return Number(value) === value;
};
const isString = (value) => {
  return typeof value === "string";
};
export {
  isAny,
  isArray,
  isBoolean,
  isFloat,
  isFunction,
  isInteger,
  isNumber,
  isObject,
  isString
};
