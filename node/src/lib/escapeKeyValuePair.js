import escapeHTML from "./escapeHTML.js";

export default (target = {}) => {
  const parameters = Object.entries(target || {});
  
  for (let i = 0; i < parameters?.length; i += 1) {
    const [key, value] = parameters[i];
    delete target[key];
    target[escapeHTML(key)] = escapeHTML(value);
  }
  
  return target;
};
