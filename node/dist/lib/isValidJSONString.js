var isValidJSONString_default = (JSONString = "") => {
  try {
    JSON.parse(JSONString);
    return true;
  } catch (error) {
    return false;
  }
};
export {
  isValidJSONString_default as default
};
