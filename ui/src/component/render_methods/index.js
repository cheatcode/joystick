import component from './component.js';
import component_ssr from './component_ssr.js';
import each from './each.js';
import html from './html.js';
import i18n from './i18n.js';
import raw from './raw.js';
import when from './when.js';

const render_methods = {
	c: component,
	component,
	component_ssr,
	e: each,
	each,
	h: html,
	html,
	i: i18n,
	i18n,
	r: raw,
	raw,
	w: when,
	when,
};

export default render_methods;
