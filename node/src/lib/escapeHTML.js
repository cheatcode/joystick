import { HTML_ENTITY_MAP } from "./constants.js";

export default (string = '') => {
  return String(string).replace(/[&<>"'`=]/g, function (match) {
    return HTML_ENTITY_MAP[match];
  });
};
