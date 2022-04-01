export default (text = '') => {
  try {
    const json = JSON.parse(text);
    return json;
  } catch (exception) {
    return {};
  }
}