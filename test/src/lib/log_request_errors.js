const log_request_errors = (label = '', errors = []) => {
  console.error(`${label} failed with the following errors:`);

  for (let i = 0; i < errors?.length; i += 1) {
    const error = errors[i];
    
    console.error(error.message);

    if (error.stack) {
      console.error(error.stack);
    }
  }
};

export default log_request_errors;
