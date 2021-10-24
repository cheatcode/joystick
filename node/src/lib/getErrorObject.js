export default (error = {}) => {
  return Object.getOwnPropertyNames(error).reduce((errorObject, key) => {
    errorObject[key] = error[key];
    return errorObject;
  }, {});
};
