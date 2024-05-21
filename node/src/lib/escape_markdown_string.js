import escape_html from './escape_html.js';

const escape_markdown_string = (markdown_string = '') => {
  const code_block_regex = /(```[\s\S]*?```)/g;
  let markdown_segments = markdown_string.split(code_block_regex);

  for (let i = 0; i < markdown_segments.length; i++) {
    if (!markdown_segments[i].match(code_block_regex)) {
      markdown_segments[i] = escape_html(markdown_segments[i]);
    }
  }

  return markdown_segments.join('');
};

export default escape_markdown_string;
