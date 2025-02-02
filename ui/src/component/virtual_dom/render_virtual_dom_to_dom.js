import is_valid_attribute_name from "../dom/is_valid_attribute_name.js";
import types from '../../lib/types.js';
import { set_special_attribute } from './special_attributes.js';

const render_dom_node = (virtual_dom_node = {}, options = {}) => {
  const element_is_svg = virtual_dom_node?.tag_name?.toLowerCase() === 'svg' || options?.is_svg_child;
  const element = element_is_svg ? 
    document.createElementNS('http://www.w3.org/2000/svg', virtual_dom_node?.tag_name) : 
    document.createElement(virtual_dom_node.tag_name);
  const attributes = Object.entries(virtual_dom_node.attributes);

  for (let i = 0; i < attributes.length; i += 1) {
    const [key, value] = attributes[i];
    
    const was_special_attribute = set_special_attribute(element, key, value);
    
    if (!was_special_attribute && is_valid_attribute_name(key)) {
      element.setAttribute(key, value);
    }
  }

  for (let i = 0; i < virtual_dom_node?.children?.length; i += 1) {
    const child_virtual_dom_node = virtual_dom_node?.children[i];

    if (child_virtual_dom_node) {
      const child_dom_node = render_virtual_dom_to_dom(child_virtual_dom_node, {
        is_svg_child: element_is_svg,
      });

      element.appendChild(child_dom_node);
    }
  }

  return element;
};

const render_virtual_dom_to_dom = (virtual_dom_node = null, options = {}) => {
  if (types.is_string(virtual_dom_node)) {
    return document.createTextNode(virtual_dom_node);
  }

  return render_dom_node(virtual_dom_node, options);
};

export default render_virtual_dom_to_dom;