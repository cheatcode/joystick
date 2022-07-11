import throwFrameworkError from "./lib/throwFrameworkError";

export default (joystick = {}) => {
  try {
    if (typeof window !== "undefined") {
      window.joystick = {
        ...(window.joystick || {}),
        settings: window.__joystick_settings__,
        ...joystick,
      }
    }
  } catch (exception) {
    throwFrameworkError('attachJoystickToWindow', exception);
  }
};