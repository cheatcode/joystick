import add_node_to_tree from '../../tree/add_node_to_tree.js';

const component_ssr = function component_ssr(Component = {}, props = {}) {
	// NOTE: We bind the component_ssr() render method to the parent component_ssr instance
	// inside of the component_ssr class definition.

	const parent = this;
	const component_instance = Component({
		parent,
		props,
		translations: parent?.translations,
		url: parent?.url,
	});

	console.log('COMPONENT SSR', component_instance?.options?.wrapper?.id);

	component_instance.parent = parent;

	add_node_to_tree(component_instance, this.ssr_tree);

	return `{{${component_instance.id}:${component_instance.instance_id}}}`;
};

export default component_ssr;