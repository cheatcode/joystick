/* eslint-disable consistent-return */

const actionMethod = () => {
  try {
    // Perform a single step in your action here.
  } catch (exception) {
    throw new Error(`[test.actionMethod] ${exception.message}`);
  }
};

const validateOptions = (options) => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.someOption) throw new Error('options.someOption is required.');
  } catch (exception) {
    throw new Error(`[test.validateOptions] ${exception.message}`);
  }
};

const test = (options, { resolve, reject }) => {
  try {
    validateOptions(options);
    // Call action methods in sequence here.
    resolve();
  } catch (exception) {
    reject(`[test] ${exception.message}`);
  }
};

export default (options) =>
  new Promise((resolve, reject) => {
    test(options, { resolve, reject });
  });
	