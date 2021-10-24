import getErrorObject from "./getErrorObject";

export default (exception = {}, location = "") => {
  return {
    error: getErrorObject(exception),
    message: exception?.message || exception?.reason || exception,
    location,
  };
};
