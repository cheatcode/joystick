import constants from "./constants.js";

const escape_html = (string = '') => {
  return String(string).replace(/[&<>"'`=]/g, function (match) {
    return constants.HTML_ENTITY_MAP[match];
  });
};

export default escape_html;