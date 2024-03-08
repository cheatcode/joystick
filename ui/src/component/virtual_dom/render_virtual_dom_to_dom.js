import is_valid_attribute_name from "../dom/is_valid_attribute_name.js";
import types from '../../lib/types.js';

const render_dom_node = (virtual_dom_node = {}) => {
  const element = document.createElement(virtual_dom_node.tag_name);
  const attributes = Object.entries(virtual_dom_node.attributes);

  for (let i = 0; i < attributes.length; i += 1) {
    const [key, value] = attributes[i];
    if (is_valid_attribute_name(key)) {
      element.setAttribute(key, value);
    }
  }

  for (let i = 0; i < virtual_dom_node?.children?.length; i += 1) {
    const child_virtual_dom_node = virtual_dom_node?.children[i];

    if (child_virtual_dom_node) {
      const child_dom_node = render_virtual_dom_to_dom(child_virtual_dom_node);
      element.appendChild(child_dom_node);
    }
  }

  return element;
};

const render_virtual_dom_to_dom = (virtual_dom_node = null) => {
  // NOTE: buildVirtualDOM (./build) can potentially return a string if the node
  // being rendered is text.
  if (types.is_string(virtual_dom_node)) {
    return document.createTextNode(virtual_dom_node);
  }

  return render_dom_node(virtual_dom_node);
};

export default render_virtual_dom_to_dom;
