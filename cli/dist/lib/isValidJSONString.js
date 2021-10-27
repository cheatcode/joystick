var isValidJSONString_default = (JSONString = "") => {
  try {
    JSON.parse(JSONString);
  } catch (error) {
    return false;
  }
  return true;
};
export {
  isValidJSONString_default as default
};
