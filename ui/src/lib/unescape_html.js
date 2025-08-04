const unescape_html = (escaped_string) => {
  if (typeof escaped_string !== 'string') {
    return escaped_string;
  }
  
  return escaped_string
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");
};

export default unescape_html;
