export default (JSONString = "") => {
  try {
    JSON.parse(JSONString);
  } catch (error) {
    return false;
  }

  return true;
};
