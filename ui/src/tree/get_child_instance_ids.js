const get_child_instance_ids = (children = {}) => {
	return Object.values(children)?.flatMap((child_instance_ids = []) => {
		return child_instance_ids;
	});
};

export default get_child_instance_ids;
