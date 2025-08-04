import escape_html from '../../lib/escape_html.js';

const is_plain_object = (obj) => {
  return obj !== null && 
         typeof obj === 'object' && 
         (obj.constructor === Object || obj.constructor === undefined);
};

const escape_ssr_data = (data) => {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    return escape_html(data);
  }

  if (typeof data === 'number' || typeof data === 'boolean') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => escape_ssr_data(item));
  }

  if (is_plain_object(data)) {
    const escaped_object = {};
    for (const [key, value] of Object.entries(data)) {
      escaped_object[key] = escape_ssr_data(value);
    }
    return escaped_object;
  }

  // For all other objects (Date, RegExp, custom classes, etc.), return as-is
  return data;
};

export default escape_ssr_data;
