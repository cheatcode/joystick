import build_existing_state_map from './build_existing_state_map.js';
import clean_up_tree from "../tree/clean_up.js";
import compile_state from "./state/compile.js";
import constants from "../lib/constants.js";
import debounce from "../lib/debounce.js";
import diff_virtual_dom from "./virtual_dom/diff.js";
import generate_id from "../lib/generate_id.js";
import get_child_instance_ids from "../tree/get_child_instance_ids.js";
import get_children_from_tree from "../tree/get_children_from_tree.js";
import register_component_options from "./register_component_options.js";
import render_methods from './render_methods/index.js';
import replace_child_in_vdom from "../tree/replace_child_in_vdom.js";
import run_tree_job from "../tree/jobs/run.js";
import track_function_call from "../test/track_function_call.js";
import types from "../lib/types.js";

class Component {
	constructor(component_options = {}) {
		this.set_interval = this.set_interval.bind(this);
		this.setInterval = this.setInterval.bind(this);
		this.set_timeout = this.set_timeout.bind(this);
		this.setTimeout = this.setTimeout.bind(this);
		this.sync_dom_to_vdom = this.sync_dom_to_vdom.bind(this);
		
		register_component_options(this, component_options);
	}

  cleanup_html(html = '', linkedom_document = null) {
		const div = (typeof document === 'undefined' ? linkedom_document : document).createElement('div');
    div.innerHTML = html;
    return div.innerHTML;
  }

	compile_render_methods(new_children = {}, existing_state_map = {}, ssr_tree = null) {
		return Object.entries(render_methods).reduce((methods, [key, value]) => {
			let instance_to_bind = {
				...(this || {}),
			};

			if (key === 'component') {
				instance_to_bind = {
					...(this || {}),
	        new_children,
	        existing_state_map,
	        ssr_tree: ssr_tree ? {
	        	push: (node) => {
	        		ssr_tree.push(node);
	        	},
	        } : null,
	        track_child: !ssr_tree ? (child_component_instance = {}) => {
	        	const existing_component_id = new_children[child_component_instance?.id];

	        	if (existing_component_id) {
	        		existing_component_id.push(child_component_instance?.instance_id);
	        	} else {
	        		new_children[child_component_instance?.id] = [child_component_instance?.instance_id];
	        	}
	        } : null,
				}
			}

			if (key !== 'component_ssr') {
				// NOTE: When rendering for SSR, swap the normal component render method with the SSR version.
				const render_method_to_bind = key === 'component' && !!ssr_tree ? render_methods.component_ssr : value;
      	methods[key] = render_method_to_bind.bind(instance_to_bind);
			}

      return methods;
    }, {});
	}

	async fetch_data(api = {}, req = {}, input = {}, component_instance = this) {
	  if (component_instance?.options?.data && types.is_function(component_instance.options.data)) {
	    const data = await component_instance.options.data(api, req, input, component_instance);
	    component_instance.data = data;
	    return data;
	  }

	  return null;
	}

	render_child_dom_node_to_virtual_dom(dom_node = {}) {
		if (dom_node.tagName === 'WHEN') {
      return [].flatMap.call(dom_node?.childNodes || [], (child_node) => {
        if (child_node?.tagName === 'WHEN') {
          return this.render_child_dom_node_to_virtual_dom(child_node);
        }

        return this.render_dom_to_virtual_dom(child_node);
      });
    }

    return this.render_dom_to_virtual_dom(dom_node);
	}

	parse_attributes(attributes = {}) {
		return Object.values(attributes)
      .reduce((parsed_attributes = {}, attribute) => {
        parsed_attributes[attribute.name] = attribute.value;
        return parsed_attributes;
      }, {});
	}

	render_for_mount() {
    track_function_call(`ui.${this?.options?.test?.name || generate_id()}.render_for_mount`, []);

		// NOTE: Pass both new_children and existing_children for consistency,
		// even though existing_children don't exist at mount time.
		const new_children = {};
		// this.existing_children = {};

		const component_html = this.render_to_html(new_children);
		const html = this.replace_when_tags(component_html);
		const dom = this.render_html_to_dom(html);
		const virtual_dom = this.render_dom_to_virtual_dom(dom);

		this.DOMNode = dom;
		this.virtual_dom = virtual_dom;
		this.children = new_children;

		this.sync_children_to_parent(this.children, this.DOMNode, this.virtual_dom);

		return this.DOMNode;
	}

	async render_for_ssr(api = {}, req = {}, ssr_tree = [], render_for_ssr_options = {}) {
		return new Promise(async (resolve) => {
			// NOTE: Fetch data for this component before rendering to HTML so the render() method has
			// access to the data at render time.
			const component_data = await this.fetch_data(api, req, {}, this);
			const new_children = {};
			const existing_state_map = {};

			// this.existing_children = {};

			let component_html = this.render_to_html(new_children, existing_state_map, ssr_tree, render_for_ssr_options?.linkedom_document);
			const child_data = {};

			for (let i = 0; i < ssr_tree?.length; i += 1) {
				const node = ssr_tree[i];
				const node_data = await this.fetch_data(api, req, {}, node);
				const node_html = node.render_to_html(new_children, existing_state_map, ssr_tree, render_for_ssr_options?.linkedom_document);
				component_html = component_html.replace(`{{${node.id}:${node.instance_id}}}`, node_html);
				child_data[node?.id] = node_data;
			}

			ssr_tree.push(this);

			const html = this.replace_when_tags(component_html);
			const css = run_tree_job('css', { ssr_tree, is_email: render_for_ssr_options?.is_email || false });

			resolve({
				html,
				css,
				data: {
					[this.id]: component_data,
					...(child_data || {}),
				},
			});
		});
	}

	render_html_to_dom(html = '') {
		const template = document.createElement('template');
		template.innerHTML = html;
		return template?.content?.firstChild;
	}

	replace_when_tags(html = '') {
    return html;
	}

	render_to_html(new_children = {}, existing_state_map = {}, ssr_tree = null, linkedom_document = {}) {
		const render_methods = this.compile_render_methods(new_children, existing_state_map, ssr_tree);
		const html = this.options.render({ ...(this || {}), ...render_methods });
		const clean_html = this.cleanup_html(html, linkedom_document);
		const sanitized_html = this.sanitize_html(clean_html);
		const wrapped_html = this.wrap_html(sanitized_html);

		return wrapped_html;
	}

	render_dom_to_virtual_dom(dom_node = {}) {
		const tag_name = (dom_node && dom_node.tagName && dom_node.tagName.toLowerCase()) || 'text';

		if (tag_name === 'text') {
			return dom_node.textContent;
		}

		const virtual_dom_node = {
			tag_name,
			attributes: this.parse_attributes(dom_node?.attributes),
			children: [].flatMap.call(dom_node?.childNodes || [], (child_node) => {
        return this.render_child_dom_node_to_virtual_dom(child_node);
      }),
		};

		const component_id = dom_node?.getAttribute('js-c');
		const instance_id = dom_node?.getAttribute('js-i');

		if (component_id) {
			virtual_dom_node.component_id = component_id;
		}

		if (instance_id) {
			virtual_dom_node.instance_id = instance_id;
		}

		return virtual_dom_node;
	}

	rerender(options = {}) {
		track_function_call(`ui.${this?.options?.test?.name || generate_id()}.rerender`, [
			options,
		]);

		// run_tree_job('clear_timers', { root_instance_id: this?.instance_id });
		run_tree_job('lifecycle.onBeforeRender', { root_instance_id: this?.instance_id });

		/*
			TODO:

			- Swap existing_children idea with existing_state_map.
			- existing_state_map will be a compilation of all state of children from this parent downward.
			- Pass existing_state_map down to render_to_html() -> compile_render_methods().
			- Each successive level should have access to that via its parent.
		*/

		const new_children = {};
		const existing_state_map = build_existing_state_map(this.instance_id);

		console.log({
			existing_state_map,
		});
	
		// this.existing_children = { ...(this.children || {}) };

		// NOTE: Once we have a copy of current children as existing_children
		// in memory, dump them from the parent instance.
		this.children = {};

		// NOTE: Unregister listeners for this root node and its children as they're
		// going to be removed and re-rendered.
		run_tree_job('detach_event_listeners', { root_instance_id: this?.instance_id });

		// NOTE: As part of render_to_html(), we expect new_children to be populated
		// with the new child instance_ids via the track_child method we pass to the
		// render methods via the .bind() to the parent in compile_render_methods.
		const component_html = this.render_to_html(new_children, existing_state_map);
		const new_html = this.replace_when_tags(component_html);
		const new_dom = this.render_html_to_dom(new_html);
		const new_virtual_dom = this.render_dom_to_virtual_dom(new_dom);
		const dom_node_patches = diff_virtual_dom(this.virtual_dom, new_virtual_dom);

		if (types.is_function(dom_node_patches)) {
			const patched_dom_node = dom_node_patches(this.DOMNode);

			this.DOMNode = patched_dom_node;
			this.virtual_dom = new_virtual_dom;

			// NOTE: After all tree-related work is done, set the new children back on the
			// parent instance. Doing this here ensures any tree jobs don't get tripped up
			// by children they don't recognize.
			this.children = new_children;
			this.sync_children_to_parent(this.children, this.DOMNode, this.virtual_dom);

			// NOTE: Set DOMNode after children are sync'd so this.DOMNode is kept fresh.
			// this.DOMNode = patched_dom_node;
		};

		run_tree_job('attach_event_listeners', { root_instance_id: this?.instance_id });

		run_tree_job('lifecycle.onRender', { root_instance_id: this?.instance_id });

		if (types.is_function(options?.after_set_state_rerender)) {
			options.after_set_state_rerender();
		}

		if (types.is_function(options?.after_refetch_data_rerender)) {
			options.after_refetch_data_rerender();
		}

		// NOTE: Do after clean up so we don't reattach styles for old nodes.
		run_tree_job('css');

		// NOTE: Clean up the linked list by removing any nodes with an instance ID
		// that no longer exists in the DOM.
		clean_up_tree();
	}

	sanitize_html(html = '') {
		const html_comments_to_replace = html.match(constants.JOYSTICK_COMMENT_REGEX) || [];
    
    for (let i = 0; i < html_comments_to_replace?.length; i += 1) {
    	html = html.replace(html_comments_to_replace[i], '');
    }

    return html;
	}

	set_interval(callback = null, delay = 0) {
		return this.setInterval(callback, delay);
	}

	setInterval(callback = null, delay = 0) {
		track_function_call(`ui.${this?.options?.test?.name || generate_id()}.set_interval`, [
			callback,
			delay,
		]);

    if (callback) {
      this.timers.push(window.setInterval(callback, delay));
    }
  }

  set_state(state = {}, callback = null) {
  	return this.setState(state, callback);
  }

	setState(state = {}, callback = null) {
		track_function_call(`ui.${this?.options?.test?.name || generate_id()}.set_state`, [
			state,
			callback,
		]);

		this.state = compile_state(this, {
      ...(this.state || {}),
      ...state,
    });

    this.rerender({
      after_set_state_rerender: () => {
        if (callback && types.is_function(callback)) {
          callback();
        }
      },
    });
	}

  set_timeout(callback = null, delay = 0) {
  	return this.setTimeout(callback, delay);
  }

	setTimeout(callback = null, delay = 0) {
		track_function_call(`ui.${this?.options?.test?.name || generate_id()}.set_timeout`, [
			callback,
			delay,
		]);

    if (callback) {
      this.timers.push(window.setTimeout(callback, delay));
    }
  }

  sync_children_to_parent(children = {}, dom = {}, virtual_dom = {}) {
  	if (dom) {
	  	const child_instance_ids = get_child_instance_ids(children);
	  	const child_nodes = get_children_from_tree(child_instance_ids);

	  	// NOTE: Because we ultimately mount the parent's DOM node to the screen, we want to ensure
	  	// that children of the parent reference the DOM node the *parent* created, not the one the
	  	// child created when it rendered itself (that only exists temporarily to get back the HTML
	  	// for the child at render time).
	  	for (let i = 0; i < child_nodes?.length; i += 1) {
	  		const child_node = child_nodes[i];
	  		const child_node_in_parent_dom = dom.querySelector(`[js-i="${child_node?.instance_id}"]`);

	  		child_node.dom = child_node_in_parent_dom;
	  		child_node.DOMNode = child_node_in_parent_dom;

	  		replace_child_in_vdom(virtual_dom, child_node?.instance_id, child_node?.virtual_dom);
	  	}
  	}
  }

  sync_dom_to_vdom() {
  	// NOTE: Helper API for capturing non-Joystick DOM changes in the virtual DOM.
  	// Allows developers to communicate that there was a foreign DOM manipulation and
  	// Joystick needs to resync its vdom.
  	this.virtual_dom = this.render_dom_to_virtual_dom(this.DOMNode);
  }

	wrap_html(html = '') {
		const wrapper_tag = (this.options?.wrapper?.tagName || this.options?.wrapper?.tag_name)?.toLowerCase() || 'div';
		const wrapper_id = this.options?.wrapper?.id || null;
		const wrapper_class_list = (this.options?.wrapper?.classList || this.options?.wrapper?.class_list)?.join(' ') || '';
		const wrapper_attributes = this.options?.wrapper?.attributes?.reduce((attributes_string = '', attribute = {}) => {
			attributes_string += `${attribute?.key}="${attribute?.value}" `;
			return attributes_string;
		}, '') || '';

		return `<${wrapper_tag} ${wrapper_attributes} ${wrapper_id ? `id="${wrapper_id}"` : ''} ${wrapper_class_list ? `class="${wrapper_class_list}"` : ''} js-c="${this.id}" js-i="${this.instance_id}">${html}</${wrapper_tag}>`;
	}
}

export default Component;
