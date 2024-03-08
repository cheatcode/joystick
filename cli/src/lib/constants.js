const constants = {
	EXAMPLE_CODE_REGEX: new RegExp(/\<example\>[^%]+\<\/example\>/g),
	EXPORT_DEFAULT_REGEX: new RegExp(/export default [a-zA-Z0-9]+/g),
	JOYSTICK_COMMENT_REGEX: new RegExp(/\<\!\-\-(.|\n|\r)*?-->/g),
	JOYSTICK_COMPONENT_REGEX: new RegExp(/\.component\(\{/g),
	JOYSTICK_UI_REGEX: new RegExp(/joystick-ui-test|joystick.js\/ui-canary|joystick.js\/ui/g),
	OBJECT_REGEX: new RegExp(/{([^;]*)}/g),
	SETTINGS_FILE_NAME_REGEX: new RegExp(/settings\.+[a-z]+\.json/g),
};

export default constants;