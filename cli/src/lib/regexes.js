export const EXAMPLE_CODE_REGEX = new RegExp(/\<example\>[^%]+\<\/example\>/g);
export const EXPORT_DEFAULT_REGEX = new RegExp(/export default [a-zA-Z0-9]+/g);
export const JOYSTICK_COMMENT_REGEX = new RegExp(/\<\!\-\-(.|\n|\r)*?-->/g);
export const JOYSTICK_COMPONENT_REGEX = new RegExp(/\.component\(\{/g);
export const JOYSTICK_UI_REGEX = new RegExp(/@joystick.js\/ui/g);
export const OBJECT_REGEX = new RegExp(/{([^;]*)}/g);

export const SETTINGS_FILE_NAME_REGEX = new RegExp(/settings.[a-zA-Z0-9]+.json/g);