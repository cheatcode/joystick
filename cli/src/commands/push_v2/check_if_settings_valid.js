const check_if_settings_valid = (settings = '') => {
  try {
    JSON.parse(settings);
    return true;
  } catch (exception) {
    return false;
  }
};

export default check_if_settings_valid;
