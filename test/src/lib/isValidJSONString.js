export default (JSONString = "") => {
  try {
    return JSON.parse(JSONString);
  } catch (error) {
    return false;
  }
};
