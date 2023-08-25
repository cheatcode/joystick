import child_process from "child_process";
import CLILog from "../CLILog.js";

const handleAvaSTDERR = (stderr = '', options = {}) => {
  try {
    // NOTE: Squash output about using a configuration file (we always do in the framework).
    if (stderr?.includes('Using configuration')) {
      return null;
    }

    if (stderr?.includes('No tests found')) {
      return CLILog('No tests found. Add tests in the /tests folder at the root of your Joystick app.', {
        level: 'danger',
        docs: 'https://cheatcode.co/docs/joystick/test/setup',
      });
    }
    
    console.log(stderr);
  } catch (exception) {
    throw new Error(`[runTests.handleAvaSTDERR] ${exception.message}`);
  }
};

const handleAvaSTDOUT = (stdout = '', options = {}) => {
  try {
    // NOTE: Squash output about using a configuration file (we always do in the framework).
    if (stdout?.includes('Using configuration')) {
      return null;
    }

    if (stdout?.includes('No tests found in')) {
      const [message] = stdout?.split(',');
      return console.log(`${message}\n`);
    }
    
    console.log(stdout);
  } catch (exception) {
    throw new Error(`[runTests.handleAvaSTDOUT] ${exception.message}`);
  }
};

const handleAvaSTDIO = (ava = {}, options = {}) => {
  try {
    ava.stdout.on('data', function (data) {
      const string = data.toString();
      handleAvaSTDOUT(string, options);
    });

    ava.stderr.on('data', function (data) {
      const string = data.toString();
      handleAvaSTDERR(string, options);
    });
  } catch (exception) {
    throw new Error(`[runTests.handleAvaSTDIO] ${exception.message}`);
  }
};

const runAva = (options = {}) => {
  try {
    // NOTE: A little bananas to reason through this. In order for Ava to run w/o errors,
    // the Ava binary being run here has to be identical to the one used in @joystick.js/test.
    // That would equal the copy of Ava that's installed in a Joystick app's node_modules
    // directory, not the node_modules directory of the CLI here. We can guarantee that will
    // exist for the CLI here because a developer has to install @joystick.js/test which will
    // add Ava as a dependency to their app in order to write tests.
    const avaPath = `${process.cwd()}/node_modules/.bin/ava`;
    
    return new Promise((resolve, reject) => {
      // NOTE: Despite using the app's node_modules path to reference Ava, we still want to reference
      // the internal path here for the default test config in /lib/dev/tests.config.js.
      const ava = child_process.exec(`${avaPath} --config ${options?.__dirname}/tests.config.js ${options?.watch ? '--watch' : ''}`, {
        stdio: 'inherit',
        env: {
          ...(process.env),
          databases: process.databases,
          FORCE_COLOR: "1"
        }
      }, (error) => {
        if (!error) {
          // NOTE: Do this here because the standard SIGINT and SIGTERM hooks the dev process
          // listens for don't catch a clean exit (and the process.exit() hook fires after exit).
          options.cleanupProcess.send(JSON.stringify(({ processIds: options?.processIds })));
          resolve();
        } else {
          // NOTE: Do not report any Ava errors here because they're picked up by the handleAvaSTDIO();
          // hook below. Just do a clean exit here so Node doesn't hang.
          options.cleanupProcess.send(JSON.stringify(({ processIds: options?.processIds })));
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
    if (!options) throw new Error('options object is required.');
    if (!options.__dirname) throw new Error('options.__dirname is required.');
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

export default (options) =>
  new Promise((resolve, reject) => {
    runTests(options, { resolve, reject });
  });
