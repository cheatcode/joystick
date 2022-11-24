var checkIfValidJSON_default = (text = "") => {
  try {
    const json = JSON.parse(text);
    return json;
  } catch (exception) {
    return {};
  }
};
export {
  checkIfValidJSON_default as default
};
