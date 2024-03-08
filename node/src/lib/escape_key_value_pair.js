import escape_html from "./escape_html.js";

const escape_key_value_pair = (target = {}) => {
  const parameters = Object.entries(target || {});
  
  for (let i = 0; i < parameters?.length; i += 1) {
    const [key, value] = parameters[i];
    delete target[key];
    target[escape_html(key)] = escape_html(value);
  }
  
  return target;
};

export default escape_key_value_pair;
