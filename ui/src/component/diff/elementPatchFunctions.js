import diffAttributes from "./attributes";
import diffChildren from "./children";

export default {
  select: (oldVirtualNode, newVirtualNode) => {
    // NOTE: Tentative. This properly handles re-rendering selects without breaking the
    // value but its a bit excessive to handle a single element like this.
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