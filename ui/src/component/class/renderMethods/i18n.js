import throwFrameworkError from "../../../lib/throwFrameworkError";

export default () => {
  try {
    // Do it to it, Lars.
  } catch (exception) {
    throwFrameworkError('component.renderMethods.i18n', exception);
  }
};
