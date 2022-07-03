import throwFrameworkError from "../lib/throwFrameworkError";

export default (component = {}) => {
  try {
    window.joystick._internal.tree = {
      id: component?.id || null,
      instance: component,
      children: [],
    };
  } catch (exception) {
    throwFrameworkError('mount.initializeJoystickComponentTree', exception);
  }
};