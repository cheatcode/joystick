import throwFrameworkError from "../../../lib/throwFrameworkError";

export default () => {
  try {
    // Do it to it, Lars.
  } catch (exception) {
    throwFrameworkError('component.renderMethods.when', exception);
  }
};
