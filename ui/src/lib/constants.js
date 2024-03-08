export const CSS_COMMENT_REGEX = new RegExp(/\/\*[^*]*\*+([^/*][^*]*\*+)*\//g);
export const CSS_SELECTOR_REGEX = new RegExp(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g);
export const JOYSTICK_COMMENT_REGEX = new RegExp(/\<\!\-\-(?:.|\n|\r)*?-->/g);
export const WHEN_TAG_REGEX = new RegExp('<when>|</when>', 'g');

const constants = {
	CSS_COMMENT_REGEX,
	CSS_SELECTOR_REGEX,
	JOYSTICK_COMMENT_REGEX,
	WHEN_TAG_REGEX,
};

export default constants;
