var formatAPIError_default = (exception = {}, location = "", code = 0) => {
  return {
    code,
    error: exception,
    message: exception?.message || exception?.reason || exception,
    location
  };
};
export {
  formatAPIError_default as default
};
