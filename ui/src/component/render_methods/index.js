import component from './component.js';
import component_ssr from './component_ssr.js';
import each from './each.js';
import i18n from './i18n.js';
import when from './when.js';

const render_methods = {
	c: component,
	component,
	component_ssr,
	e: each,
	each,
	i: i18n,
	i18n,
	w: when,
	when,
};

export default render_methods;
