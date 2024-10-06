import fs from 'fs';
import cli_log from '../../lib/cli_log.js';
import is_valid_json_string from '../../lib/is_valid_json_string.js';
import path_exists from '../../lib/path_exists.js';

const { readFile } = fs.promises;

const read_settings_file = async (environment = '') => {
  const settings_file_name = `settings.${environment}.json`;
  const settings_file_exists = await path_exists(settings_file_name);

  if (!settings_file_exists) {
    cli_log(
      `Could not find a ${settings_file_name} in your project. Double-check this exists and try again.`,
      {
        level: "danger",
        docs: "https://cheatcode.co/docs/push/config"
      }
    );

    return process.exit(0);
  }

  return readFile(settings_file_name, 'utf-8');
};

const get_settings_file = async (options) => {
  const settings_file_name = `settings.${options?.environment}.json`;
  const raw_settings_file = await read_settings_file(options?.environment);
  const settings_file_is_valid_json = is_valid_json_string(raw_settings_file);

  if (!settings_file_is_valid_json) {
    cli_log(
      `${settings_file_name} contains invalid JSON. Double-check the syntax and try again.`,
      {
        level: "danger",
        docs: "https://cheatcode.co/docs/push/config"
      }
    );

    return process.exit(0);
  }

  return JSON.parse(raw_settings_file);
};

export default get_settings_file;
