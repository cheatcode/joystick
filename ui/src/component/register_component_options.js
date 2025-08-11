import Cookies from 'js-cookie';
import compile_default_props from './props/compile_default.js';
import compile_methods from './methods/compile.js';
import compile_props from './props/compile.js';
import compile_state from './state/compile.js';
import compile_url from './url/compile.js';
import dynamic_page from './dynamic_page/index.js';
import generate_id from '../lib/generate_id.js';
import load_data_from_window from './data/load_data_from_window.js';
import validate_form from '../forms/validate.js';
import register_websockets_on_component from '../websockets/register_on_component.js';
import types from '../lib/types.js';

const register_component_options = (component_instance = {}, component_options = {}) => {
	// NOTE: Set this first as we reference internally in some of the functions below.
	component_instance.id = component_options?._componentId || null;

	component_instance.css = component_options?.css;
	component_instance.data = typeof window !== 'undefined' ? load_data_from_window(component_instance) : {};
	component_instance.defaultProps = compile_default_props(component_instance, component_options?.defaultProps || {});
	component_instance.default_props = compile_default_props(component_instance, component_options?.default_props || {});
	component_instance.dom = {};
	component_instance.DOMNode = null;
	
	component_instance.dynamic_page = {
		load: (dynamic_page_options = {}) => dynamic_page.load(component_instance, dynamic_page_options),
	};

	component_instance.dynamic_page_props = {};
	component_instance.events = component_options?.events;
	component_instance.instance_id = generate_id(8);
	component_instance.lifecycle = component_options?.lifecycle || {};
	component_instance.methods = compile_methods(component_instance, component_options?.methods || {});
	component_instance.options = component_options;	
	component_instance.url = typeof window !== 'undefined' ? compile_url(window.__joystick_url__) : compile_url(component_options?.url);
	component_instance.user = typeof window !== 'undefined' ? window.__joystick_user__ : component_options?.user;
	component_instance.props = compile_props(component_options?.defaultProps || component_options?.default_props, component_options?.props || {});
	component_instance.state = compile_state(component_instance, component_options?.state || {});
	component_instance.test = component_options?.test;
	component_instance.timers = [];
	component_instance.translations = component_options?.translations || {};
	component_instance.validateForm = validate_form;
	component_instance.validate_form = validate_form;
	component_instance.virtual_dom = {};
	component_instance.wrapper = {};

	// NOTE: We assume that Joystick will load the IIFE version of Mod's JS
	// so window.mod should be available.
	if (typeof window !== 'undefined' && window.mod) {
		// NOTE: Do this last to avoid any conflicts at render time.
		component_instance.mod = window.mod || {};
	}

  if (typeof window !== 'undefined' && component_options?.websockets && types.is_function(component_options?.websockets)) {
  	register_websockets_on_component(component_options, component_instance);
  }

	// NOTE: Load last to ensure component render is prioritized.
	component_instance.cookies = Cookies;
};

export default register_component_options;
