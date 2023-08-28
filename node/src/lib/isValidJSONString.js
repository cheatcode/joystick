export default (JSONString = "") => {
  try {
    JSON.parse(JSONString);
    return true;
  } catch (error) {
    return false;
  }
};
