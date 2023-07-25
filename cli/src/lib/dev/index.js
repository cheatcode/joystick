/* eslint-disable consistent-return */

const actionMethod = () => {
  try {
    // Perform a single step in your action here.
  } catch (exception) {
    throw new Error(`[dev.actionMethod] ${exception.message}`);
  }
};

const validateOptions = (options) => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.environment) throw new Error('options.environment is required.');
  } catch (exception) {
    throw new Error(`[dev.validateOptions] ${exception.message}`);
  }
};

const dev = (options, { resolve, reject }) => {
  try {
    validateOptions(options);
    
    /*
      TODO:
    
      - [ ] Make sure we're in a Joystick project.
      - [ ] If environment === 'test', check that both a .joystick fo lder exists AND a /tests folder
            exists. If no /tests, log out docs on how to scaffold your tests.
      - [ ] Load settings.<environment>.json.
      - [ ] Start databases relative to options.environment (development|test) from settings.<environment>.json.
      - [ ] Start the app as normal from the build directory.
      - [ ] If environment === 'test', run the tests.
      - [ ] If environment === 'test', after tests, run process.exit(0).
    */
    
    resolve();
  } catch (exception) {
    reject(`[dev] ${exception.message}`);
  }
};

export default (options) =>
  new Promise((resolve, reject) => {
    dev(options, { resolve, reject });
  });
	