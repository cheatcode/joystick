export default (json = '{}') => {
  try {
    const parsedJSON = JSON.parse(json);
    return parsedJSON;
  } catch {
    // NOTE: If the above catches, we didn't get valid JSON. Just return
    // whatever we got to the request (e.g., a string).
    return json;
  }
};