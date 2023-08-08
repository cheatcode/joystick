import { HTML_ENTITY_MAP } from "./constants.js";
var escapeHTML_default = (string = "") => {
  return String(string).replace(/[&<>"'`=]/g, function(match) {
    return HTML_ENTITY_MAP[match];
  });
};
export {
  escapeHTML_default as default
};
