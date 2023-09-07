import fs from "fs";
import CLILog from "../CLILog.js";
import isValidJSONString from "../isValidJSONString.js";
const warnIfInvalidJSONInSettings = (settings = "", processIds = []) => {
  try {
    const isValidJSON = isValidJSONString(settings);
    const context = process.env.NODE_ENV === "test" ? "test" : "start";
    if (!isValidJSON) {
      CLILog(
        `Failed to parse settings file. Double-check the syntax in your settings.${process.env.NODE_ENV}.json file at the root of your project and rerun joystick ${context}.`,
        {
          level: "danger",
          docs: `https://cheatcode.co/docs/joystick/environment-settings`,
          tools: [{ title: "JSON Linter", url: "https://jsonlint.com/" }]
        }
      );
      if (process.cleanupProcess) {
        process.cleanupProcess.send(JSON.stringify({ processIds }));
      }
      process.exit(0);
    }
  } catch (exception) {
    throw new Error(`[loadSettings.warnIfInvalidJSONInSettings] ${exception.message}`);
  }
};
const getSettings = (settingsPath = "") => {
  try {
    return fs.readFileSync(settingsPath, "utf-8");
  } catch (exception) {
    throw new Error(`[loadSettings.getSettings] ${exception.message}`);
  }
};
const warnIfSettingsNotFound = (settingsPath = "", processIds = []) => {
  try {
    const hasSettingsFile = fs.existsSync(settingsPath);
    const context = process.env.NODE_ENV === "test" ? "test" : "start";
    if (!hasSettingsFile) {
      CLILog(
        `A settings file could not be found for this environment (${process.env.NODE_ENV}). Create a settings.${process.env.NODE_ENV}.json file at the root of your project and rerun joystick ${context}.`,
        {
          level: "danger",
          docs: `https://cheatcode.co/docs/joystick/cli/${context}`
        }
      );
      if (process.cleanupProcess) {
        process.cleanupProcess.send(JSON.stringify({ processIds }));
      }
      process.exit(0);
    }
  } catch (exception) {
    throw new Error(`[loadSettings.warnIfSettingsNotFound] ${exception.message}`);
  }
};
const validateOptions = (options) => {
  try {
    if (!options)
      throw new Error("options object is required.");
    if (!options.environment)
      throw new Error("options.environment is required.");
  } catch (exception) {
    throw new Error(`[loadSettings.validateOptions] ${exception.message}`);
  }
};
const loadSettings = (options, { resolve, reject }) => {
  try {
    validateOptions(options);
    const settingsPath = `${process.cwd()}/settings.${options.environment}.json`;
    warnIfSettingsNotFound(settingsPath, options.processIds);
    const settings = getSettings(settingsPath);
    warnIfInvalidJSONInSettings(settings, options.processIds);
    process.env.JOYSTICK_SETTINGS = settings;
    resolve({
      parsed: JSON.parse(settings),
      unparsed: settings
    });
  } catch (exception) {
    reject(`[loadSettings] ${exception.message}`);
  }
};
var loadSettings_default = (options) => new Promise((resolve, reject) => {
  loadSettings(options, { resolve, reject });
});
export {
  loadSettings_default as default
};
