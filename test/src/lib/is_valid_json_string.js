const is_valid_json_string = (JSONString = "") => {
  try {
    return JSON.parse(JSONString);
  } catch (error) {
    return false;
  }
};

export default is_valid_json_string;
