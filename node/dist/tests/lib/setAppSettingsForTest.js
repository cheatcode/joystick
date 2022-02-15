var setAppSettingsForTest_default = (settings = {}) => {
  process.env.JOYSTICK_SETTINGS = JSON.stringify(settings || {});
};
export {
  setAppSettingsForTest_default as default
};
