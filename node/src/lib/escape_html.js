const HTML_ENTITY_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '`': '&#96;',
  '=': '&#61;',
  '/': '&#47;',
  '\\': '&#92;',
  '\u0009': '&#9;',
  '\u000A': '&#10;',
  '\u000C': '&#12;',
  '\u000D': '&#13;',
  '{': '&#123;',
  '}': '&#125;',
  '(': '&#40;',
  ')': '&#41;',
  '[': '&#91;',
  ']': '&#93;',
  '!': '&#33;',
  '$': '&#36;',
  '%': '&#37;',
  '*': '&#42;',
  '+': '&#43;',
  ',': '&#44;',
  '-': '&#45;',
  '.': '&#46;',
  ':': '&#58;',
  ';': '&#59;',
  '?': '&#63;',
  '@': '&#64;',
  '^': '&#94;',
  '_': '&#95;',
  '|': '&#124;'
};

const ESCAPE_PATTERN = new RegExp(
  `[${Object.keys(HTML_ENTITY_MAP).map((character) => {
    return character.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }).join('')}]`,
  'g'
);

const escape_html = (input = '') => {
  const string = String(input).replace(/\r\n/g, '\n');
  return string.replace(ESCAPE_PATTERN, (match) =>  {
    return HTML_ENTITY_MAP[match] || match;
  });
};

export default escape_html;
