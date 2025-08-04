import unescape_html from '../../lib/unescape_html.js';

const raw = function(content = '') {
  return unescape_html(content);
};

export default raw;
