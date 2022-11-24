import diffAttributes from "./attributes";
import diffChildren from "./children";

export default {
  select: (oldVirtualNode, newVirtualNode) => {
    // NOTE: This properly handles re-rendering selects without breaking the
    // value. Not ideal, but this makes the behavior stable/predictable.
    return (node) => {
      const oldValue = node.value;
      node.replaceChildren();

      diffAttributes(oldVirtualNode.attributes, newVirtualNode.attributes)(node),
      diffChildren([], newVirtualNode.children)(node);

      const oldValueExists = node.querySelector(`option[value="${oldValue}"]`);

      if (oldValueExists) {
        node.value = oldValue;
      }

      if (!oldValueExists) {
        const firstOption = node.querySelector('option');
        node.value = firstOption?.value || '';
      }

      return node;
    };
  },
};