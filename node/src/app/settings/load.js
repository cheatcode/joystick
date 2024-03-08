import is_valid_json from "../../lib/is_valid_json.js";
import parse_json from "../../lib/parse_json.js";

const default_settings = {
  config: {},
  global: {},
  public: {},
  private: {},
};

const load = () => {
  const has_settings = !!process.env.JOYSTICK_SETTINGS;
  const settings = `${process.env.JOYSTICK_SETTINGS}`.replace(/\\/g, '');
  const settings_are_valid = has_settings && is_valid_json(settings);

  if (!has_settings) {
    return default_settings;
  }

  if (!settings_are_valid) {
    console.warn(
      `Could not parse settings. Please verify that your settings.${process.env.NODE_ENV}.json file exports a valid JSON object.`
    );

    return default_settings;
  }

  const parsed_settings = parse_json(settings);

  return parsed_settings || default_settings;
};

export default load;
