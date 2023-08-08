import escapeHTML from "./escapeHTML.js";
var escapeKeyValuePair_default = (target = {}) => {
  const parameters = Object.entries(target || {});
  for (let i = 0; i < parameters?.length; i += 1) {
    const [key, value] = parameters[i];
    delete target[key];
    target[escapeHTML(key)] = escapeHTML(value);
  }
  return target;
};
export {
  escapeKeyValuePair_default as default
};
