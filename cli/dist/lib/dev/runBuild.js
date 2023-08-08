const actionMethod = () => {
  try {
  } catch (exception) {
    throw new Error(`[runBuild.actionMethod] ${exception.message}`);
  }
};
const validateOptions = (options) => {
  try {
    if (!options)
      throw new Error("options object is required.");
    if (!options.port)
      throw new Error("options.port is required.");
  } catch (exception) {
    throw new Error(`[runBuild.validateOptions] ${exception.message}`);
  }
};
const runBuild = (options, { resolve, reject }) => {
  try {
    validateOptions(options);
    resolve();
  } catch (exception) {
    reject(`[runBuild] ${exception.message}`);
  }
};
var runBuild_default = (options) => new Promise((resolve, reject) => {
  runBuild(options, { resolve, reject });
});
export {
  runBuild_default as default
};
