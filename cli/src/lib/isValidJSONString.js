export default (JSONString = "") => {
  try {
    const json = JSON.parse(JSONString);
    return json;
  } catch (error) {
    return false;
  }
};
