import fs from 'fs';
import cli_log from './cli_log.js';
import is_valid_json_string from './is_valid_json_string.js';
import path_exists from './path_exists.js';

const { readFile } = fs.promises;

const load_settings = async (environment = null) => {
  const settings_file_path = `${process.cwd()}/settings.${environment}.json`;
  const has_settings_file = await path_exists(settings_file_path);

  if (!has_settings_file) {
    cli_log(`A settings file could not be found for this environment (${environment}). Create a settings.${environment}.json file at the root of your project and restart Joystick.`, {
      level: 'danger',
      docs: 'https://github.com/cheatcode/joystick#settings',
    });

    process.exit(0);
  }

  const raw_settings_file = await readFile(settings_file_path, "utf-8");
  const is_valid_json = is_valid_json_string(raw_settings_file);

  if (!is_valid_json) {
    cli_log(`Failed to parse settings file. Double-check the syntax in your settings.${environment}.json file at the root of your project and restart Joystick.`, {
      level: 'danger',
      docs: 'https://github.com/cheatcode/joystick#settings',
      tools: [
        { title: 'JSON Linter', url: 'https://jsonlint.com/' }
      ],
    });
    process.exit(0);
  }

  const settings_file = is_valid_json ? raw_settings_file : "{}";

  return JSON.parse(settings_file);
};

export default load_settings;
