import stringContainsHTML from "../../../lib/stringContainsHTML";
import throwFrameworkError from "../../../lib/throwFrameworkError";

const when = function when(test = false, htmlToRender = '') {
  try {
    if (test) {
      // NOTE: Run a trim() to avoid whitespace/newlines in HTML passed to <when>
      // generating unnecessary text nodes that leave <when> tags in the render.
      return `<when>${htmlToRender.trim()}</when>`;
    }


    // NOTE: Return default as a text node containing false (we replace this dynamically when
    // building the DOM so it never renders in the browser). Blank space here is INTENTIONAL
    // to ensure a text node is returned when the <when></when> tag is dynamically replaced.
    return '<when> </when>';
  } catch (exception) {
    throwFrameworkError('component.renderMethods.when', exception);
  }
};

export default when;
