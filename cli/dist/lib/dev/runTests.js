import child_process from "child_process";
import CLILog from "../CLILog.js";
const handleAvaSTDERR = (stderr = "", options = {}) => {
  try {
    if (stderr?.includes("Using configuration")) {
      return null;
    }
    if (stderr?.includes("No tests found")) {
      return CLILog("No tests found. Add tests in the /tests folder at the root of your Joystick app.", {
        level: "danger",
        docs: "https://cheatcode.co/docs/joystick/test/setup"
      });
    }
    console.log(stderr);
  } catch (exception) {
    throw new Error(`[runTests.handleAvaSTDERR] ${exception.message}`);
  }
};
const handleAvaSTDOUT = (stdout = "", options = {}) => {
  try {
    if (stdout?.includes("Using configuration")) {
      return null;
    }
    if (stdout?.includes("No tests found in")) {
      const [message] = stdout?.split(",");
      return console.log(`${message}
`);
    }
    console.log(stdout);
  } catch (exception) {
    throw new Error(`[runTests.handleAvaSTDOUT] ${exception.message}`);
  }
};
const handleAvaSTDIO = (ava = {}, options = {}) => {
  try {
    ava.stdout.on("data", function(data) {
      const string = data.toString();
      handleAvaSTDOUT(string, options);
    });
    ava.stderr.on("data", function(data) {
      const string = data.toString();
      handleAvaSTDERR(string, options);
    });
  } catch (exception) {
    throw new Error(`[runTests.handleAvaSTDIO] ${exception.message}`);
  }
};
const runAva = (options = {}) => {
  try {
    const avaPath = `${process.cwd()}/node_modules/.bin/ava`;
    return new Promise((resolve, reject) => {
      const ava = child_process.exec(`${avaPath} --config ${options?.__dirname}/tests.config.js ${options?.watch ? "--watch" : ""}`, {
        stdio: "inherit",
        env: {
          ...process.env,
          databases: process.databases,
          FORCE_COLOR: "1"
        }
      }, (error) => {
        if (!error) {
          options.cleanupProcess.send(JSON.stringify({ processIds: options?.processIds }));
          resolve();
        } else {
          options.cleanupProcess.send(JSON.stringify({ processIds: options?.processIds }));
          resolve();
        }
      });
      handleAvaSTDIO(ava, options);
    });
  } catch (exception) {
    throw new Error(`[runTests.runAva] ${exception.message}`);
  }
};
const validateOptions = (options) => {
  try {
    if (!options)
      throw new Error("options object is required.");
    if (!options.__dirname)
      throw new Error("options.__dirname is required.");
  } catch (exception) {
    throw new Error(`[runTests.validateOptions] ${exception.message}`);
  }
};
const runTests = async (options, { resolve, reject }) => {
  try {
    validateOptions(options);
    await runAva(options);
    resolve();
  } catch (exception) {
    reject(`[runTests] ${exception.message}`);
  }
};
var runTests_default = (options) => new Promise((resolve, reject) => {
  runTests(options, { resolve, reject });
});
export {
  runTests_default as default
};
