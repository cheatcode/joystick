const escape_url_parameter = (string = '') => {
  return String(string).replace(/[&<>"'`=]/g, function (match) {
    const entity_map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '`': '&#x60;',
      '=': '&#x3D;'
    };
    return entity_map[match];
  });
};

const escape_key_value_pair = (target = {}) => {
  const parameters = Object.entries(target || {});
  
  for (let i = 0; i < parameters?.length; i += 1) {
    const [key, value] = parameters[i];
    delete target[key];
    target[escape_url_parameter(key)] = escape_url_parameter(value);
  }
  
  return target;
};

export default escape_key_value_pair;
