import fs from 'fs';
import log from "./log.js";
import is_valid_json_string from "./is_valid_json_string.js";

const warn_if_invalid_json_in_settings = (settings = '') => {
  const is_valid_json = is_valid_json_string(settings);
  const context = process.env.NODE_ENV === 'test' ? 'test' : 'start';

  if (!is_valid_json) {
    log(
      `Failed to parse settings file. Double-check the syntax in your settings.${process.env.NODE_ENV}.json file at the root of your project and rerun joystick ${context}.`,
      {
        level: "danger",
        docs: `https://cheatcode.co/docs/joystick/environment-settings`,
        tools: [{ title: "JSON Linter", url: "https://jsonlint.com/" }],
      }
    );

    process.exit(0);
  }
};

const get_settings = (settings_path = '') => {
  return fs.readFileSync(settings_path, 'utf-8');
};

const warn_if_settings_not_found = (settings_path = '') => {
  const has_settings_file = fs.existsSync(settings_path);
  const context = process.env.NODE_ENV === 'test' ? 'test' : 'start';

  if (!has_settings_file) {
    log(
      `A settings file could not be found for this environment (${process.env.NODE_ENV}). Create a settings.${process.env.NODE_ENV}.json file at the root of your project and rerun joystick ${context}.`,
      {
        level: "danger",
        docs: `https://cheatcode.co/docs/joystick/cli/${context}`,
      }
    );

    process.exit(0);
  }
};

const load_settings = (load_settings_options = {}) => {
  const settings_path = `${process.cwd()}/settings.test.json`;
  warn_if_settings_not_found(settings_path);
  const settings = get_settings(settings_path);
  warn_if_invalid_json_in_settings(settings);

  process.env.JOYSTICK_SETTINGS = settings;

  return {
    parsed: JSON.parse(settings),
    unparsed: settings,
  };
};

export default load_settings;

