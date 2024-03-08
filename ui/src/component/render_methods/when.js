import types from "../../lib/types.js";

const when = function when(test = false, html_to_render = '') {
  if (types.is_function(html_to_render)) {
    return test ? html_to_render() : '<when> </when>'; 
  }

  if (test) {
    // NOTE: Run a trim() to avoid whitespace/newlines in HTML passed to <when>
    // generating unnecessary text nodes that leave <when> tags in the render.
    return html_to_render.trim();
  }

  // NOTE: Return default as a text node containing false (we replace this dynamically when
  // building the DOM so it never renders in the browser). Blank space here is INTENTIONAL
  // to ensure a text node is returned when the <when></when> tag is dynamically replaced.
  return '<when> </when>';
};

export default when;
