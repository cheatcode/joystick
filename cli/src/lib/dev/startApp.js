import child_process from "child_process";
import path from "path";

const handleStartServerProcess = (execArgv = {}, options = {}) => {
  try {
    if (!options?.watch) {
      process.loader.text('Starting app...');
    }

    return child_process.fork(
      path.resolve(".joystick/build/index.server.js"),
      [],
      {
        execArgv,
        // NOTE: Pipe stdin, stdout, and stderr. IPC establishes a message channel so we
        // communicate with the child_process.
        silent: true,
        env: {
          FORCE_COLOR: "1",
          LOGS_PATH: process.env.LOGS_PATH,
          NODE_ENV: process.env.NODE_ENV,
          ROOT_URL: process.env.ROOT_URL,
          PORT: process.env.PORT,
          JOYSTICK_SETTINGS: process.env.JOYSTICK_SETTINGS,
          HMR_SESSIONS: options?.sessionsBeforeHMRUpdate || '{}',
        },
      }
    );
  } catch (exception) {
    throw new Error(`[startApp.handleStartServerProcess] ${exception.message}`);
  }
};

const getExecArgs = (nodeMajorVersion = 0) => {
  try {
    const execArgv = ["--no-warnings"];

    if (nodeMajorVersion < 19) {
      execArgv.push("--experimental-specifier-resolution=node");
    }

    if (
      process.env.NODE_ENV === "development" &&
        process.env.IS_DEBUG_MODE === "true"
      ) {
      execArgv.push("--inspect");
    }

    return execArgv;
  } catch (exception) {
    throw new Error(`[startApp.getExecArgs] ${exception.message}`);
  }
};

const validateOptions = (options) => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.nodeMajorVersion) throw new Error('options.nodeMajorVersion is required.');
    if (!options.port) throw new Error('options.port is required.');
  } catch (exception) {
    throw new Error(`[startApp.validateOptions] ${exception.message}`);
  }
};

const startApp = (options, { resolve, reject }) => {
  try {
    validateOptions(options);

    const execArgv = getExecArgs(options?.nodeMajorVersion);
    const serverProcess = handleStartServerProcess(execArgv, options);

    return resolve(serverProcess);
  } catch (exception) {
    reject(`[startApp] ${exception.message}`);
  }
};

export default (options) =>
  new Promise((resolve, reject) => {
    startApp(options, { resolve, reject });
  });
