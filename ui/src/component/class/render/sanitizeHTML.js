import throwFrameworkError from "../../../lib/throwFrameworkError";
import { JOYSTICK_COMMENT_REGEX, NEWLINE_REGEX } from "../../../lib/constants";

const removeNewLineCharacters = (html = '') => {
  try {
    return html.replace(NEWLINE_REGEX, '');
  } catch (exception) {
    throwFrameworkError('component.render.sanitizeHTML.removeNewLineCharacters', exception);
  }
};

const removeCommentedCode = (html = '') => {
  try {
    const htmlCommentsToReplace = html.match(JOYSTICK_COMMENT_REGEX) || [];
    
    htmlCommentsToReplace.forEach((filter) => {
      html = html.replace(filter, "");
    });

    return html;
  } catch (exception) {
    throwFrameworkError('component.render.sanitizeHTML.removeCommentedCode', exception);
  }
};

export default (html = '') => {
  try {
    let sanitizedHTML = `${html}`;

    sanitizedHTML = removeCommentedCode(sanitizedHTML);
    // sanitizedHTML = removeNewLineCharacters(sanitizedHTML);
 
    return sanitizedHTML;
  } catch (exception) {
    throwFrameworkError('component.render.sanitizeHTML', exception);
  }
};
