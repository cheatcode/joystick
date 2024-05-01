import debounce from "../lib/debounce.js";
import get_child_instance_ids from "./get_child_instance_ids.js";

const clean_up = () => {
	debounce(() => {
		// NOTE: If we can't find the instance_id in the DOM, we know that the instance
		// was nuked during re-render and can safely be removed from the tree.
		joystick._internal.tree = joystick?._internal?.tree?.filter((node) => {
			return !!document.querySelector(`[js-i="${node?.instance_id}"]`);
		});
	}, 500);
};

export default clean_up;
