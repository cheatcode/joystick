import fs from 'fs';
import { parseHTML } from 'linkedom';
import os from 'os';
import get_api_for_data_functions from "../api/get_api_for_data_functions.js";
import get_browser_safe_request from "../../lib/get_browser_safe_request.js";
import load_settings from '../settings/load.js';
import set_base_attributes_in_html from "./set_base_attributes_in_html.js";
import set_head_tags_in_html from "./set_head_tags_in_html.js";
import path_exists from "../../lib/path_exists.js";
import get_browser_safe_user from '../accounts/get_browser_safe_user.js';
import get_language_preference from '../../lib/get_language_preference.js';
import escape_html from '../../lib/escape_html.js';
import escape_ssr_data from './escape_ssr_data.js';

const { readFile } = fs.promises;
const app_settings = load_settings();
const is_development = process.env.NODE_ENV === 'development';

// NOTE: Set a global document so we have access to a pseudo-DOM in @joystick.js/ui
// when server-side rendering.
const { document: linkedom_document } = parseHTML('<div></div>');

const build_html_response_for_browser = (options = {}) => {
	let base_html = options?.base_html;

	if (options?.mod_theme) {
		const linkedom_base_html = parseHTML(base_html);
		linkedom_base_html.document.querySelector('body').setAttribute('data-mod-theme', options?.mod_theme);
		base_html = linkedom_base_html.document.toString();
	}

	// NOTE: Put Mod CSS first for specificity. If they have overrides at the component level
	// we should respect them.
	return base_html
		.replace('${css}', `
			${options?.mod_in_use && !options?.mod_tree_shaking ? ` <link rel="stylesheet" href="/_joystick/mod/mod-${options?.mod_theme}.css">` : ''}
			${options?.mod_in_use && options?.mod_tree_shaking && options?.mod_css ? `<style type="text/css" mod-css>${options?.mod_css}</style>` : ''}
			<style type="text/css" js-css>${options?.css}</style>
		`)
		.replace(`<div id="app"></div>`, `
			<div id="app">${options?.html}</div>
			<script type="application/json" id="__joystick_data__">
				${JSON.stringify(options?.data || {})}
			</script>
			<script>
			  const data = JSON.parse(document.getElementById('__joystick_data__').textContent || '{}');

				window.joystick = {
					settings: {
						global: ${JSON.stringify(app_settings?.global)},
						public: ${JSON.stringify(app_settings?.public)},
					},
				};

        window.__joystick_platform__ = '${os.platform()}';
        window.__joystick_data__ = data;
       	window.__joystick_i18n__ = ${JSON.stringify(options?.translations)};
        ${is_development ? `window.__joystick_hmr_port__ = ${parseInt(process.env.PORT, 10) + 1}` : ''}
        window.__joystick_layout_url__ = ${options?.render_layout_path ? `"/_joystick/${options?.render_layout_path}"` : null};
        window.__joystick_page_url__ = ${options?.render_component_path ? `"/_joystick/${options?.render_component_path}"` : null};
       	window.__joystick_request__ = ${JSON.stringify(escape_ssr_data(get_browser_safe_request(options?.req)))};
        window.__joystick_settings__ = ${JSON.stringify({
          global: app_settings?.global,
          public: app_settings?.public,
        })};

        window.__joystick_should_auto_mount__ = true;
        window.__joystick_ssr_props__ = ${JSON.stringify(escape_ssr_data(options?.props))};
        window.__joystick_url__ = ${JSON.stringify(options?.url)};
        window.__joystick_user__ = ${JSON.stringify(escape_ssr_data(get_browser_safe_user(options?.req?.context?.user)))};
        window.__joystick_language__ = ${JSON.stringify(options?.language)};
			</script>
			${options?.mod_in_use && !options?.mod_tree_shaking ? `<script src="/_joystick/mod/mod.js"></script>` : ''}
			<script type="module" src="/_joystick/utils/process.js"></script>
      <script type="module" src="/_joystick/index.client.js"></script>
      ${options?.render_component_path ? `<script data-js-component type="module" src="/_joystick/${options?.render_component_path}"></script>` : ''}
      ${options?.render_layout_path ? `<script data-js-layout type="module" src="/_joystick/${options?.render_layout_path}"></script>` : ''}
      ${is_development ? `<script type="module" src="/_joystick/hmr/client.js"></script>` : ''}
		`);
};

const build_html_response_for_email = (options = {}) => {
  return options?.base_html
  	.replace('${css}', `<style type="text/css">${options?.css}</style>`)
    .replace("${subject}", escape_html(options?.email_options?.subject || ""))
    .replace("${preheader}", escape_html(options?.email_options?.preheader || ""))
    .replace('<div id="email"></div>', `<div id="email">${options?.html}</div>`);
};

const build_html_response = (options = {}) => {
	return options?.is_email ? build_html_response_for_email(options) : build_html_response_for_browser(options);
};

const get_base_html_for_email = async (base_html_name = '') => {
	const file_name = `${base_html_name ? `base_${base_html_name}` : 'base'}.html`;
	
	// NOTE: Try to get from cache first, fallback to disk loading
	if (process._joystick_email_base_files?.[file_name]) {
		return process._joystick_email_base_files[file_name];
	}

	if (await path_exists(`email/${file_name}`)) {
		return readFile(`email/${file_name}`, 'utf-8');
	}

	console.warn(`Could not find email/${file_name}`);

	return '';
};

const get_base_css_for_email = async (base_html_name = '') => {
	const file_name = `${base_html_name ? `base_${base_html_name}` : 'base'}.css`;
	
	// NOTE: Try to get from cache first, fallback to disk loading
	if (process._joystick_email_base_files?.[file_name]) {
		return process._joystick_email_base_files[file_name];
	}

	if (await path_exists(`email/${file_name}`)) {
		return readFile(`email/${file_name}`, 'utf-8');
	}

	console.warn(`Could not find email/${file_name}`);

	return '';
};

const get_component_instance = (component_to_render = null, component_options = {}) => {
	return component_to_render(component_options);
};

const ssr = async (ssr_options = {}) => {
	const component_instance = get_component_instance(ssr_options?.component_to_render, ssr_options?.component_options);
	const api = get_api_for_data_functions(ssr_options?.req, ssr_options?.res, ssr_options?.api_schema);
	const ssr_tree = [];
	const ssr_render = await component_instance.render_for_ssr(api, ssr_options?.req, ssr_tree, {
		linkedom_document,
		is_email: ssr_options?.is_email,
		is_dynamic_page_render: ssr_options?.is_dynamic_page_render,
	});

	if (ssr_options?.is_dynamic_page_render) {
		return ssr_render?.data;
	}

	const email_base_css = ssr_options?.is_email ? await get_base_css_for_email(ssr_options?.email_options?.base_html_name) : null;
	const email_base_html = ssr_options?.is_email ? await get_base_html_for_email(ssr_options?.email_options?.base_html_name) : null;

	let mod_css = '';
	let mod_js = '';

	// NOTE: If components specified, load incrementally.
	const is_tree_shaking = ssr_options?.mod?.in_use && ssr_options?.mod?.components_in_use && ssr_options?.mod?.components_in_use?.length > 0;

	if (is_tree_shaking) {
		// NOTE: We don't need the globals for one of the themes. Determine which and nuke it.
		const theme_global_to_remove = ssr_options?.mod?.theme === 'light' ? 'dark' : 'light';
		const theme_specific_globals = { ...(ssr_options?.mod?.css?.globals) };
		delete theme_specific_globals[theme_global_to_remove];

		mod_css += Object.values(theme_specific_globals || {})?.reduce((base_css = '', css = '') => {
			base_css += css;
			return base_css;
		}, '');

		const valid_components = Object.entries(ssr_options?.mod?.css?.components)?.filter(([component_name] = '') => {
			return ssr_options?.mod?.components_in_use?.includes(component_name);
		});

		for (let i = 0; i < valid_components?.length; i += 1) {
			const [_component_name, component_css] = valid_components[i];
			mod_css += component_css[ssr_options?.mod?.theme];
		}
	}

	const determined_language = get_language_preference(ssr_options?.req);

	const html = build_html_response({
		is_email: ssr_options?.is_email,
		attributes: ssr_options?.attributes,
		base_html: ssr_options?.is_email ? email_base_html : ssr_options?.base_html,
		component_instance,
		css: ssr_options?.is_email ? `
			${email_base_css}
			${ssr_render?.css}
		` : ssr_render?.css,
		mod_version: ssr_options?.mod?.version,
		mod_in_use: ssr_options?.mod?.in_use,
		mod_tree_shaking: is_tree_shaking,
		mod_css,
		mod_js,
		mod_theme: ssr_options?.mod?.theme,
		data: ssr_render?.data, // NOTE: Assume this data was escaped by the component instance.
		email_options: ssr_options?.email_options,
		head: ssr_options?.head,
		html: ssr_render?.html,
		language: determined_language,
		props: {
			// NOTE: Pass a theme prop to ensure this is always accessible in components even if
			// the dev doesn't pass it manually.
			theme: ssr_options?.mod?.theme,
			language: determined_language,
			...(ssr_options?.component_options?.props || {})
		},
		render_component_path: ssr_options?.render_component_path,
		render_layout_path: ssr_options?.render_layout_path,
		req: ssr_options?.req,
		translations: ssr_options?.component_options?.translations,
		url: ssr_options?.component_options?.url,
	});


	const html_with_head_tags = set_head_tags_in_html(html, ssr_options?.head, ssr_options?.req);
	const html_with_base_attributes = set_base_attributes_in_html(html_with_head_tags, ssr_options?.attributes);

	return html_with_base_attributes;
};

export default ssr;
