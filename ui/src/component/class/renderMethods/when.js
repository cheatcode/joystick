import throwFrameworkError from "../../../lib/throwFrameworkError";

const when = function when(test = false, htmlToRender = '') {
  try {
    if (test) {
      return htmlToRender;
    }

    return '';
  } catch (exception) {
    throwFrameworkError('component.renderMethods.when', exception);
  }
};

export default when;
