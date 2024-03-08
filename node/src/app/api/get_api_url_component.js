const get_api_url_component = (string = '') => {
  return string.toLowerCase().replace(/\ /g, "-");
};

export default get_api_url_component;
