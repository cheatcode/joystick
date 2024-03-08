const get_parent_from_tree = (child_component_id = '', child_instance_id = '') => {
	return joystick?._internal?.tree?.find((node) => {
		const children_of_component_id = node?.children[child_component_id];
		return children_of_component_id && children_of_component_id?.includes(child_instance_id);
	});
};

export default get_parent_from_tree;
