import throwFrameworkError from "./lib/throwFrameworkError";

export default (joystick = {}) => {
  try {
    let target = null;

    // NOTE: Browser support.
    if (typeof window !== 'undefined') {
      target = window;
    }

    // NOTE: Node.js support (for testing).
    if (typeof global !== 'undefined') {
      target = global;
    }

    if (target) {
      target.joystick = {
        ...(target?.joystick || {}),
        settings: target?.__joystick_settings__,
        ...joystick,
      };
    }
  } catch (exception) {
    throwFrameworkError('attachJoystickToWindow', exception);
  }
};