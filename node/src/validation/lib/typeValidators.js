export const isAny = (value) => {
  // NOTE: We don't care about the type, just that it exists.
  return !!value;
};

export const isObject = (value) => {
  return !!(value && typeof value === "object" && !Array.isArray(value));
};

export const isArray = (value) => {
  return !!Array.isArray(value);
};

export const isBoolean = (value) => {
  return (value === true || value === false) && typeof value === "boolean";
};

export const isFloat = (value) => {
  return Number(value) === value && value % 1 !== 0;
};

export const isInteger = (value) => {
  return Number(value) === value && value % 1 === 0;
};

export const isNumber = (value) => {
  return Number(value) === value;
};

export const isString = (value) => {
  return typeof value === "string";
};
