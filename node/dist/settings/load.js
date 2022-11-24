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
    const settings = `${process.env.JOYSTICK_SETTINGS}`.replace(/\\/g, "");
    const settingsAreValid = settingsExist && isValidJSONString(settings);
    if (!settingsExist) {
      return defaultSettings;
    }
    if (!settingsAreValid) {
      console.warn(`Could not parse settings. Please verify that your settings-${process.env.NODE_ENV} exports a valid JavaScript object.`);
      return defaultSettings;
    }
    const parsedSettings = JSON.parse(settings);
    return parsedSettings || defaultSettings;
  } catch (exception) {
    console.warn(exception);
  }
};
export {
  load_default as default
};
