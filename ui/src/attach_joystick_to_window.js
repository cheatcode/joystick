import throw_framework_error from './lib/throw_framework_error.js';

/**
 * Safely attach the joystick global to the browser window.
 *
 * @param {object} joystick - The joystick global object.
 */
const attach_joystick_to_window = (joystick = {}) => {
  let target = null;


  // NOTE: Browser support.
  if (typeof window !== 'undefined') {
    target = window;
  }

  // NOTE: Node.js support (for tests).
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
};

export default attach_joystick_to_window;
