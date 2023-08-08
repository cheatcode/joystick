/* eslint-disable consistent-return */

const actionMethod = () => {
  try {
    // Perform a single step in your action here.
  } catch (exception) {
    throw new Error(`[runBuild.actionMethod] ${exception.message}`);
  }
};

const validateOptions = (options) => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.port) throw new Error('options.port is required.');
  } catch (exception) {
    throw new Error(`[runBuild.validateOptions] ${exception.message}`);
  }
};

const runBuild = (options, { resolve, reject }) => {
  try {
    validateOptions(options);
    // Call action methods in sequence here.
    resolve();
  } catch (exception) {
    reject(`[runBuild] ${exception.message}`);
  }
};

export default (options) =>
  new Promise((resolve, reject) => {
    runBuild(options, { resolve, reject });
  });
