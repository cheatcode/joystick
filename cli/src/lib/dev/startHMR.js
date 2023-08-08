import child_process from "child_process";
import path from "path";

const handleStartHMRProcess = (execArgv = {}, __dirname = '') => {
  try {
    // NOTE: Port is automatically pulled via process.env.PORT
    // in the hmrServer.js script.
    return child_process.fork(
      path.resolve(`${__dirname}/hmrServer.js`),
      [],
      {
        execArgv,
        // NOTE: Pipe stdin, stdout, and stderr. IPC establishes a message channel so we
        // communicate with the child_process.
        silent: true,
      }
    );
  } catch (exception) {
    throw new Error(`[startHMR.handleStartHMRProcess] ${exception.message}`);
  }
};

const getExecArgs = (nodeMajorVersion = 0) => {
  try {
    const execArgv = ["--no-warnings"];

    if (nodeMajorVersion < 19) {
      execArgv.push("--experimental-specifier-resolution=node");
    }
    
    return execArgv;
  } catch (exception) {
    throw new Error(`[startHMR.getExecArgs] ${exception.message}`);
  }
};

const validateOptions = (options) => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.nodeMajorVersion) throw new Error('options.nodeMajorVersion is required.');
  } catch (exception) {
    throw new Error(`[startHMR.validateOptions] ${exception.message}`);
  }
};

const startHMR = (options, { resolve, reject }) => {
  try {
    validateOptions(options);

    const execArgv = getExecArgs(options?.nodeMajorVersion);
    const hmrProcess = handleStartHMRProcess(execArgv, options?.__dirname);

    return resolve(hmrProcess);
  } catch (exception) {
    reject(`[startHMR] ${exception.message}`);
  }
};

export default (options) =>
  new Promise((resolve, reject) => {
    startHMR(options, { resolve, reject });
  });
