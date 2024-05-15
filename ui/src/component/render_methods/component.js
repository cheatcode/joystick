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

	// const existing_component_on_parent = parent?.existing_children[component_instance?.id];
	// const new_component_on_parent = parent?.new_children[component_instance?.id];
	// const existing_instance_id_on_parent = existing_component_on_parent && existing_component_on_parent[new_component_on_parent?.length || 0];
	// const existing_node_in_tree = get_node_from_tree(existing_instance_id_on_parent);

	// if (existing_node_in_tree?.state) {
	// 	component_instance.state = existing_node_in_tree?.state;
	// }

	// if (types.is_function(component_instance?.lifecycle?.onUpdateProps) || types.is_function(component_instance?.lifecycle?.on_update_props)) {
	// 	const has_different_props = nested_object_diff(existing_node_in_tree?.props, props);
	// 	if (has_different_props) {
	// 		(component_instance.lifecycle.onUpdateProps || component_instance.lifecycle.on_update_props)(existing_node_in_tree?.props, props, component_instance);
	// 	}
	// }

	const new_children = {};
	const existing_children = {};
	const component_html = component_instance.render_to_html(new_children, existing_children);
	const html = component_instance.replace_when_tags(component_html);
	const dom = component_instance.render_html_to_dom(html);
	const virtual_dom = component_instance.render_dom_to_virtual_dom(dom);

	component_instance.dom = dom;
	component_instance.DOMNode = dom;
	component_instance.virtual_dom = virtual_dom;
	component_instance.children = new_children;

	return html;
};

export default component;