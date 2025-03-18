import add_node_to_tree from '../../tree/add_node_to_tree.js';
import get_node_from_tree from "../../tree/get_node_from_tree.js";
import nested_object_diff from '../../lib/nested_object_diff.js';
import types from '../../lib/types.js';

const component = function component(Component = {}, props = {}) {
	// NOTE: We bind the component() render method to the parent component instance
	// inside of the component class definition.
	const parent = this;
	const component_instance = Component({
		parent,
		props,
		translations: parent?.translations,
		url: parent?.url,
	});

	component_instance.parent = parent;

	add_node_to_tree(component_instance);
	parent.track_child(component_instance);

	const new_component_on_parent = parent?.new_children[component_instance?.id];

	const existing_component_in_state_map = parent?.existing_state_map[component_instance?.id];
	const existing_state_for_component = existing_component_in_state_map && existing_component_in_state_map[(new_component_on_parent?.length - 1) || 0];

	const existing_component_in_props_map = parent?.existing_props_map[component_instance?.id];
	const existing_props_for_component = existing_component_in_props_map && existing_component_in_props_map[(new_component_on_parent?.length - 1) || 0];

	const new_children = {};

	const component_html = component_instance.render_to_html(new_children, parent.existing_state_map, parent.existing_props_map);
	const html = component_instance.replace_when_tags(component_html);
	const dom = component_instance.render_html_to_dom(html);
	const virtual_dom = component_instance.render_dom_to_virtual_dom(dom);

	component_instance.dom = dom;
	component_instance.DOMNode = dom;
	component_instance.virtual_dom = virtual_dom;
	component_instance.children = new_children;

	if (existing_state_for_component) {
		component_instance.state = existing_state_for_component;
	}

	if (existing_props_for_component && types.is_function(component_instance?.lifecycle?.onUpdateProps) || types.is_function(component_instance?.lifecycle?.on_update_props)) {
		const has_different_props = nested_object_diff(existing_props_for_component, props);
		if (has_different_props) {
			(component_instance.lifecycle.onUpdateProps || component_instance.lifecycle.on_update_props)(existing_props_for_component, props, component_instance);
		}
	}	

	return html;
};

export default component;