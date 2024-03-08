const format_api_error = (exception = {}, location = "", status = 0) => {
  return {
    status,
    error: exception,
    message: exception?.message || exception,
    location,
  };
};

export default format_api_error;
