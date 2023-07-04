import getErrorObject from "./getErrorObject";
var formatAPIError_default = (exception = {}, location = "") => {
  return {
    error: exception,
    message: exception?.message || exception?.reason || exception,
    location
  };
};
export {
  formatAPIError_default as default
};
