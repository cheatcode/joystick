import is_valid_attribute_name from "../dom/is_valid_attribute_name.js";
import types from '../../lib/types.js';

const special_attributes = {
  value: ['input', 'textarea', 'select', 'option'],
  checked: ['input'],
  selected: ['option'],
  disabled: ['input', 'textarea', 'select', 'button', 'option'],
  srcdoc: ['iframe'],
  muted: ['video', 'audio'],
  volume: ['video', 'audio'],
  currenttime: ['video', 'audio'],
  playbackrate: ['video', 'audio'],
  indeterminate: ['input'],
  readonly: ['input', 'textarea'],
  selectedindex: ['select']
};

const set_special_attribute = (element, key, value) => {
  const tag_name = element.tagName.toLowerCase();
  const special_config = special_attributes[key];
  
  if (!special_config) {
    return false;
  }

  const applies_to_element = special_config.includes(tag_name);
  
  if (!applies_to_element) {
    return false;
  }

  if (typeof value === 'boolean') {
    if (value) {
      element[key] = true;
      element.setAttribute(key, '');
    } else {
      element[key] = false;
      element.removeAttribute(key);
    }
    return true;
  }

  if (key === 'srcdoc') {
    const temp_div = document.createElement('div');
    temp_div.textContent = value;
    element.srcdoc = temp_div.textContent;
    return true;
  }

  element[key] = value;
  return true;
};

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