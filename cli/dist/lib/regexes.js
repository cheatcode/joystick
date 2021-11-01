const EXPORT_DEFAULT_REGEX = new RegExp(/export default [a-zA-Z0-9]+/g);
const JOYSTICK_UI_REGEX = new RegExp(/@joystick.js\/ui/g);
const OBJECT_REGEX = new RegExp(/{([^;]*)}/g);
export {
  EXPORT_DEFAULT_REGEX,
  JOYSTICK_UI_REGEX,
  OBJECT_REGEX
};
