import get_child_instance_ids from "./get_child_instance_ids.js";

const clean_up = () => {
	// NOTE: If we can't find the instance_id in the DOM, we know that the instance
	// was nuked during re-render and can safely be removed from the tree.
	joystick._internal.tree = joystick?._internal?.tree?.filter((node) => {
		return !!document.querySelector(`[js-i="${node?.instance_id}"]`);
	});

	console.log('CLEAN UP COMPLETE');
};

export default clean_up;
