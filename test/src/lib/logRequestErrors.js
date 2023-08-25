import throwFrameworkError from "./throwFrameworkError.js";

export default (label = '', errors = []) => {
  try {
    console.error(`${label} failed with the following errors:`);

    errors.forEach((error) => {
      console.log(error.message);

      if (error.stack) {
        console.log(error.stack);
      }
    });
  } catch (exception) {
    throwFrameworkError(label, exception);
  }
};