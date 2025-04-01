import attach_event_listener_for_element from "../../component/events/attach_event_listener_for_element.js";
import get_child_instance_ids from "../get_child_instance_ids.js";
import get_children_from_tree from "../get_children_from_tree.js";
import get_css_from_tree from "../get_css_from_tree.js";
import get_event_listeners_for_nodes from "../get_event_listeners_for_nodes.js";
import get_node_from_tree from "../get_node_from_tree.js";
import generate_id from "../../lib/generate_id.js";
import track_function_call from "../../test/track_function_call.js";
import types from "../../lib/types.js";

const get_nodes_for_job = (root_instance_id = '') => {
	const node = get_node_from_tree(root_instance_id);
	const child_instance_ids = get_child_instance_ids(node?.children);
	const child_nodes = get_children_from_tree(child_instance_ids);

	return [
		node,
		...(child_nodes || []),
	];
};

const clear_timers = (root_instance_id = null, existing_tree = null) => {
	// NOTE: If we call this as part of reset_tree_for_hmr, we want to wipe out ALL timers
	// on the tree (the original root instance gets delete on remount).
	const nodes = root_instance_id && !existing_tree ? get_nodes_for_job(root_instance_id) : (existing_tree || []);
	const timers = nodes?.flatMap((node) => {
		return node?.timers ? Object.values(node?.timers) : [];
	});

	for (let i = 0; i < timers?.length; i += 1) {
		const timer_id = timers[i];
		// NOTE: Modern browsers should support both of these the same,
		// but to guarantee timers get cleared, run both on the timer_id.
		clearTimeout(timer_id);
		clearInterval(timer_id);
	}
};

const clear_websockets = () => {
  const components = Object.entries(window.__joystick_hmr_previous_websockets__ || {});

  for (let i = 0; i < components.length; i += 1) {
    const [component_id, websockets_by_name] = components[i];

    const websockets = Object.values(websockets_by_name || {});
    
    for (let j = 0; j < websockets.length; j += 1) {
      const websocket = websockets[j];
      
      if (websocket?.client?.close && types.is_function(websocket.client.close)) {
        websocket.client.close(1000); // Normal closure
      }
    }
  }
};

const jobs = {
	'attach_event_listeners': ({ root_instance_id }) => {
		const nodes = window?.joystick?._internal?.tree;
		const event_listeners = get_event_listeners_for_nodes(nodes);

		for (let i = 0; i < event_listeners?.length; i += 1) {
			const event_listener = event_listeners[i];
			const elements = document.querySelectorAll(`[js-i="${event_listener?.instance?.instance_id}"] ${event_listener?.selector}`);
			const render_methods = event_listener?.instance?.compile_render_methods();

			for (let i = 0; i < elements?.length; i += 1) {
				const element = elements[i];
				attach_event_listener_for_element(event_listener, element, render_methods);
			}
		}

		return event_listeners;
	},
	'clear_timers': ({ root_instance_id = null }) => {
		clear_timers(root_instance_id);
	},
	'clear_websockets': ({ root_instance_id = null }) => {
		clear_websockets();
	},
	'css': ({ is_mount = false, is_email = false, ssr_tree = null }) => {
    const existing_style_tag = typeof window !== 'undefined' ? document.head.querySelector(`style[js-css]`) : null;
    const built_css = get_css_from_tree(ssr_tree || window.joystick?._internal?.tree, is_email);

    let stringified_css = !!ssr_tree ? built_css?.reverse().join("").trim() : built_css?.join("").trim();

    if (typeof window !== 'undefined' && existing_style_tag) {
    	existing_style_tag.innerHTML = stringified_css;
    }

    return stringified_css;
	},
	'detach_event_listeners': ({ root_instance_id }) => {
		const nodes = window?.joystick?._internal?.tree;
		const event_listeners = nodes?.filter((node) => {
			return !!node?._event_listeners;
		}).flatMap((node) => {
			return node?._event_listeners;
		});

		for (let i = 0; i < event_listeners?.length; i += 1) {
			const event_listener = event_listeners[i];
			event_listener.element.removeEventListener(event_listener?.type, event_listener?.handler);
		}

		for (let i = 0; i < nodes?.length; i += 1) {
			const node = nodes[i];
			node._event_listeners = [];
		}
	},
	'lifecycle.onBeforeMount': ({ root_instance_id }) => {
		const nodes = get_nodes_for_job(root_instance_id);

		for (let i = 0; i < nodes?.length; i += 1) {
			const node = nodes[i];
			if (types.is_function(node?.lifecycle?.onBeforeMount) || types.is_function(node?.lifecycle?.on_before_mount)) {
				(node.lifecycle.onBeforeMount || node.lifecycle.on_before_mount)(node);
				track_function_call(`ui.${node?.options?.test?.name || generate_id()}.lifecycle.on_before_mount`, [node]);
			}
		}
	},
	'lifecycle.timers': ({ root_instance_id }) => {
		const nodes = get_nodes_for_job(root_instance_id);

		for (let i = 0; i < nodes?.length; i += 1) {
			const node = nodes[i];
			if (types.is_function(node?.lifecycle?.timers)) {
				node.lifecycle.timers(node);
				track_function_call(`ui.${node?.options?.test?.name || generate_id()}.lifecycle.timers`, [node]);
			}
		}
	},
	'lifecycle.onMount': ({ root_instance_id }) => {
		const nodes = get_nodes_for_job(root_instance_id);

		for (let i = 0; i < nodes?.length; i += 1) {
			const node = nodes[i];
			if (types.is_function(node?.lifecycle?.onMount) || types.is_function(node?.lifecycle?.on_mount)) {
				(node.lifecycle.onMount || node.lifecycle.on_mount)(node);
				track_function_call(`ui.${node?.options?.test?.name || generate_id()}.lifecycle.on_mount`, [node]);
			}
		}
	},
	'lifecycle.onBeforeRender': ({ root_instance_id }) => {
		const nodes = get_nodes_for_job(root_instance_id);

		for (let i = 0; i < nodes?.length; i += 1) {
			const node = nodes[i];
			if (types.is_function(node?.lifecycle?.onBeforeRender) || types.is_function(node?.lifecycle?.on_before_render)) {
				(node.lifecycle.onBeforeRender || node.lifecycle.on_before_render)(node);
				track_function_call(`ui.${node?.options?.test?.name || generate_id()}.lifecycle.on_before_render`, [node]);
			}
		}
	},
	'lifecycle.onRender': ({ root_instance_id }) => {
		const nodes = get_nodes_for_job(root_instance_id);

		for (let i = 0; i < nodes?.length; i += 1) {
			const node = nodes[i];
			if (types.is_function(node?.lifecycle?.onRender) || types.is_function(node?.lifecycle?.on_render)) {
				(node.lifecycle.onRender || node.lifecycle.on_render)(node);
				track_function_call(`ui.${node?.options?.test?.name || generate_id()}.lifecycle.on_render`, [node]);
			}
		}
	},
	'lifecycle.onUpdateProps': ({ root_instance_id }) => {
		const nodes = get_nodes_for_job(root_instance_id);

		for (let i = 0; i < nodes?.length; i += 1) {
			const node = nodes[i];
			if (types.is_function(node?.lifecycle?.onUpdateProps) || types.is_function(node?.lifecycle?.on_update_props)) {
				(node.lifecycle.onUpdateProps || node.lifecycle.on_update_props)(node);
				track_function_call(`ui.${node?.options?.test?.name || generate_id()}.lifecycle.on_update_props`, [node]);
			}
		}
	},
	'lifecycle.onRefetchData': ({ root_instance_id }) => {
		const nodes = get_nodes_for_job(root_instance_id);

		for (let i = 0; i < nodes?.length; i += 1) {
			const node = nodes[i];
			if (types.is_function(node?.lifecycle?.onRefetchData) || types.is_function(node?.lifecycle?.on_refetch_data)) {
				(node.lifecycle.onRefetchData || node.lifecycle.on_refetch_data)(node);
				track_function_call(`ui.${node?.options?.test?.name || generate_id()}.lifecycle.on_refetch_data`, [node]);
			}
		}
	},
	'lifecycle.onBeforeUnmount': ({ root_instance_id }) => {
		const nodes = get_nodes_for_job(root_instance_id);

		for (let i = 0; i < nodes?.length; i += 1) {
			const node = nodes[i];
			if (types.is_function(node?.lifecycle?.onBeforeUnmount) || types.is_function(node?.lifecycle?.on_before_unmount)) {
				(node.lifecycle.onBeforeUnmount || node.lifecycle.on_before_unmount)(node);
				track_function_call(`ui.${node?.options?.test?.name || generate_id()}.lifecycle.on_before_unmount`, [node]);
			}
		}
	},
	'reset_tree_for_hmr': () => {
		clear_timers(null, window.__joystick_hmr_previous_tree__);
		clear_websockets();
		window.__joystick_hmr_previous_tree__ = [];
		window.__joystick_hmr_previous_websockets__ = {};
	},
};

export default jobs;
