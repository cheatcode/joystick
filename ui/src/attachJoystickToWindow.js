export default (joystick = {}) => {
  if (typeof window !== "undefined") {
    window.joystick = {
      ...(window.joystick || {}),
      settings: window.__joystick_settings__,
      ...joystick,
    }
  }
};