const parse_json = (json = '{}') => {
  try {
    const parsed_json = JSON.parse(json);
    return parsed_json;
  } catch {
    // NOTE: If the above catches, we didn't get valid JSON. Just return
    // whatever we got to the request (e.g., a string).
    return json;
  }
};

export default parse_json;
