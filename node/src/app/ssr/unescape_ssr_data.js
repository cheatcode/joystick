const unescape_html = (str) => {
  if (typeof str !== 'string') return str;
  
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
};

const is_plain_object = (obj) => {
  return obj !== null && 
         typeof obj === 'object' && 
         (obj.constructor === Object || obj.constructor === undefined);
};

const unescape_ssr_data = (data) => {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    return unescape_html(data);
  }

  if (typeof data === 'number' || typeof data === 'boolean') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => unescape_ssr_data(item));
  }

  if (is_plain_object(data)) {
    const unescaped_object = {};
    for (const [key, value] of Object.entries(data)) {
      unescaped_object[key] = unescape_ssr_data(value);
    }
    return unescaped_object;
  }

  // For all other objects (Date, RegExp, custom classes, etc.), return as-is
  return data;
};

export default unescape_ssr_data;
