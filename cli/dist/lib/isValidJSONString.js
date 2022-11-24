var isValidJSONString_default = (JSONString = "") => {
  try {
    const json = JSON.parse(JSONString);
    return json;
  } catch (error) {
    return false;
  }
};
export {
  isValidJSONString_default as default
};
