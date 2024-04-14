import diff_attributes from "./diff_attributes.js";
import diff_children from "./diff_children.js";

const element_patch_functions = {
  select: (old_virtual_node, new_virtual_node) => {
    // NOTE: This properly handles re-rendering selects without breaking the
    // value. Not ideal, but this makes the behavior stable/predictable.
    return (node) => {
      const old_value = node.value;
      node.replaceChildren();

      diff_attributes(old_virtual_node.attributes, new_virtual_node.attributes)(node),
      diff_children([], new_virtual_node.children)(node);

      const old_value_exists = node.querySelector(`option[value="${old_value}"]`);

      if (old_value_exists) {
        node.value = old_value;
      }

      if (!old_value_exists) {
        const first_option = node.querySelector('option');
        node.value = first_option?.value || '';
      }

      return node;
    };
  },
};

export default element_patch_functions;
