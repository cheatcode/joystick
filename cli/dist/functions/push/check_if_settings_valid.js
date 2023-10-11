var check_if_settings_valid_default = (settings = "") => {
  try {
    JSON.parse(settings);
    return true;
  } catch (exception) {
    return false;
  }
};
export {
  check_if_settings_valid_default as default
};
