const get_node_from_tree = (instance_id = '') => {
	return window?.joystick?._internal?.tree?.find((node) => {
		return node?.instance_id === instance_id;
	});
};

export default get_node_from_tree;
