var getErrorObject_default = (error = {}) => {
  return Object.getOwnPropertyNames(error).reduce((errorObject, key) => {
    errorObject[key] = error[key];
    return errorObject;
  }, {});
};
export {
  getErrorObject_default as default
};
