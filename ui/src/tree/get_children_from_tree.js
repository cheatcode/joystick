import get_child_instance_ids from "./get_child_instance_ids.js";

const get_children_from_tree = (child_instance_ids = [], existing_child_nodes = []) => {
	const child_nodes = existing_child_nodes || [];

	const child_nodes_matching_instance_ids = window?.joystick?._internal?.tree?.filter((node) => {
		return child_instance_ids?.includes(node?.instance_id);
	});

	for (let i = 0; i < child_nodes_matching_instance_ids?.length; i += 1) {
		const child_node = child_nodes_matching_instance_ids[i];

		child_nodes.push(child_node);
		
		const child_node_children_instance_ids = get_child_instance_ids(child_node.children);

		if (child_node_children_instance_ids?.length > 0) {
			get_children_from_tree(child_node_children_instance_ids, child_nodes);
		}
	}

	return child_nodes;
};

export default get_children_from_tree;
