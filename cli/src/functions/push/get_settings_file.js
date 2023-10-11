import fs from 'fs';
import CLILog from '../../lib/CLILog.js';
import check_if_settings_valid from './check_if_settings_valid.js';

const read_settings_file = (environment = '') => {
  try {
    const settings_file_name = `settings.${environment}.json`;
    const settings_file_exists = fs.existsSync(settings_file_name);

    if (!settings_file_exists) {
      CLILog(
        `Could not find a ${settings_file_name} in your project. Double-check this exists and try again.`,
        {
          level: "danger",
          docs: "https://cheatcode.co/docs/push/config"
        }
      );

      return process.exit(0);
    }

    return fs.readFileSync(settings_file_name);
  } catch (exception) {
    throw new Error(`[get_settings_file.read_settings_file] ${exception.message}`);
  }
};

const validate_options = (options) => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.environment) throw new Error('options.environment is required.');
  } catch (exception) {
    throw new Error(`[get_settings_file.validate_options] ${exception.message}`);
  }
};

const get_settings_file = (options, { resolve, reject }) => {
  try {
    validate_options(options);

    const settings_file_name = `settings.${options?.environment}.json`;
    const raw_settings_file = read_settings_file(options?.environment);
    const settings_file_is_valid_json = check_if_settings_valid(raw_settings_file);

    if (!settings_file_is_valid_json) {
      CLILog(
        `${settings_file_name} contains invalid JSON. Double-check the syntax and try again.`,
        {
          level: "danger",
          docs: "https://cheatcode.co/docs/push/config"
        }
      );

      return process.exit(0);
    }

    resolve(JSON.parse(raw_settings_file));
  } catch (exception) {
    reject(`[get_settings_file] ${exception.message}`);
  }
};

export default (options) =>
  new Promise((resolve, reject) => {
    get_settings_file(options, { resolve, reject });
  });
