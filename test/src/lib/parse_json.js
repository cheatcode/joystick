const parse_json = (json = '{}') => {
  try {
    const parsed_json = JSON.parse(json);
    return parsed_json;
  } catch {
    return {};
  }
};

export default parse_json;
