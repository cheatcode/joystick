export default (settings = '') => {
  try {
    JSON.parse(settings);
    return true;
  } catch (exception) {
    return false;
  }
};
