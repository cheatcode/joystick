const unescape_html = (escaped_string) => {
  if (typeof escaped_string !== 'string') {
    return escaped_string;
  }
  
  const unescaped_string = escaped_string
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&#x60;/g, "`")
    .replace(/&#x3D;/g, "=");

  console.log({ escaped_string, unescaped_string });
  
  return unescaped_string; 
};

export default unescape_html;
