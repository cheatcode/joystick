const isAny = (value) => {
  return !!value;
};
const isObject = (value) => {
  return !!(value && typeof value === "object" && !Array.isArray(value));
};
const isArray = (value) => {
  return !!Array.isArray(value);
};
const isBoolean = (value) => {
  return (value === true || value === false) && typeof value === "boolean";
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
  isInteger,
  isNumber,
  isObject,
  isString
};
