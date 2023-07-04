import getErrorObject from "./getErrorObject";

export default (exception = {}, location = "") => {
  return {
    error: exception,
    message: exception?.message || exception?.reason || exception,
    location,
  };
};
