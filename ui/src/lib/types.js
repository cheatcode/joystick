import throwFrameworkError from "./throwFrameworkError";

export const isAny = (value) => {
  try {
    // NOTE: We don't care about the type, just that it exists.
    return !!value;
  } catch (exception) {
    throwFrameworkError('types.isAny', exception);
  }
};

export const isUndefined = (value) => {
  try {
    return typeof value === 'undefined';
  } catch (exception) {
    throwFrameworkError('types.isUndefined', exception);
  }
};

export const isNull = (value) => {
  try {
    return value === null;
  } catch (exception) {
    throwFrameworkError('types.isNull', exception);
  }
};

export const isDOM = (value) => {
  try {
    return value instanceof Element;
  } catch (exception) {
    throwFrameworkError('types.isDOM', exception);
  }
}

export const isArray = (value) => {
  try {
    return !!Array.isArray(value);
  } catch (exception) {
    throwFrameworkError('types.isArray', exception);
  }
};

export const isBoolean = (value) => {
  try {
    return (value === true || value === false);
  } catch (exception) {
    throwFrameworkError('types.isBoolean', exception);
  }
};

export const isFloat = (value) => {
  try {
    return Number(value) === value && value % 1 !== 0;
  } catch (exception) {
    throwFrameworkError('types.isFloat', exception);
  }
};

export const isFunction = (value) => {
  try {
    return typeof value === 'function';
  } catch (exception) {
    throwFrameworkError('types.isFunction', exception);
  }
};

export const isInteger = (value) => {
  try {
    return Number(value) === value && value % 1 === 0;
  } catch (exception) {
    throwFrameworkError('types.isInteger', exception);
  }
};

export const isObject = (value) => {
  try {
    return !!(value && typeof value === "object" && !Array.isArray(value));
  } catch (exception) {
    throwFrameworkError('types.isObject', exception);
  }
};

export const isNumber = (value) => {
  try {
    return Number(value) === value;
  } catch (exception) {
    throwFrameworkError('types.isNumber', exception);
  }
};

export const isString = (value) => {
  try {
    return typeof value === "string";
  } catch (exception) {
    throwFrameworkError('types.isString', exception);
  }
};
