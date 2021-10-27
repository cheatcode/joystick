import isValidJSONString from "../lib/isValidJSONString";
const defaultSettings = {
  config: {},
  keys: {
    global: {},
    public: {},
    private: {}
  }
};
var load_default = () => {
  try {
    const settingsExist = !!process.env.JOYSTICK_SETTINGS;
    const settingsAreValid = settingsExist && isValidJSONString(process.env.JOYSTICK_SETTINGS);
    if (!settingsExist) {
      return defaultSettings;
    }
    if (!settingsAreValid) {
      console.warn(`Could not parse settings. Please verify that your settings-${process.env.NODE_ENV} exports a valid JavaScript object.`);
      return defaultSettings;
    }
    const settings = JSON.parse(process.env.JOYSTICK_SETTINGS);
    return settings || defaultSettings;
  } catch (exception) {
    console.warn(exception);
  }
};
export {
  load_default as default
};
