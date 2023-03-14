import fs from "fs";
import CLILog from "./CLILog.js";
import isValidJSONString from "./isValidJSONString.js";
var loadSettings_default = async (env = null) => {
  const environment = env;
  const settingsFilePath = `${process.cwd()}/settings.${environment}.json`;
  const hasSettingsFile = fs.existsSync(settingsFilePath);
  if (!hasSettingsFile) {
    CLILog(`A settings file could not be found for this environment (${environment}). Create a settings.${environment}.json file at the root of your project and restart Joystick.`, {
      level: "danger",
      docs: "https://github.com/cheatcode/joystick#settings"
    });
    process.exit(0);
  }
  const rawSettingsFile = fs.readFileSync(settingsFilePath, "utf-8");
  const isValidJSON = isValidJSONString(rawSettingsFile);
  if (!isValidJSON) {
    CLILog(`Failed to parse settings file. Double-check the syntax in your settings.${environment}.json file at the root of your project and restart Joystick.`, {
      level: "danger",
      docs: "https://github.com/cheatcode/joystick#settings",
      tools: [
        { title: "JSON Linter", url: "https://jsonlint.com/" }
      ]
    });
    process.exit(0);
  }
  const settingsFile = isValidJSON ? rawSettingsFile : "{}";
  process.env.JOYSTICK_SETTINGS = settingsFile;
  return JSON.parse(settingsFile);
};
export {
  loadSettings_default as default
};
