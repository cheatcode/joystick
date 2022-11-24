export default (settings = {}) => {
  process.env.JOYSTICK_SETTINGS = JSON.stringify(settings || {});
};