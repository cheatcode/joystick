const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const XLINK_NAMESPACE = 'http://www.w3.org/1999/xlink';

const is_svg_tag = (tag_name) => {
  const svg_tags = ['svg', 'path', 'rect', 'circle', 'line', 'polyline', 'polygon', 'text', 'g', 'use'];
  return svg_tags.includes(tag_name.toLowerCase());
};

const create_element = (virtual_node, is_svg = false) => {
  if (typeof virtual_node === 'string') {
    return document.createTextNode(virtual_node);
  }

  is_svg = is_svg || virtual_node.tag_name.toLowerCase() === 'svg';
  
  let element;
  if (is_svg) {
    element = document.createElementNS(SVG_NAMESPACE, virtual_node.tag_name);
  } else {
    element = document.createElement(virtual_node.tag_name);
  }

  update_attributes(element, {}, virtual_node.attributes || {}, is_svg);
  if (virtual_node.component_id) element.setAttribute('js-c', virtual_node.component_id);
  if (virtual_node.instance_id) element.setAttribute('js-i', virtual_node.instance_id);
  
  (virtual_node.children || []).forEach(child => {
    element.appendChild(create_element(child, is_svg));
  });
  
  return element;
};

const update_attributes = (element, old_attrs, new_attrs, is_svg = false) => {
  const all_attrs = new Set([...Object.keys(old_attrs), ...Object.keys(new_attrs)]);
  
  for (const attr of all_attrs) {
    if (!(attr in new_attrs)) {
      element.removeAttribute(attr);
    } else if (old_attrs[attr] !== new_attrs[attr]) {
      set_attribute(element, attr, new_attrs[attr], is_svg);
    }
  }
};

const set_attribute = (element, attr, value, is_svg) => {
  if (is_svg && attr.startsWith('xlink:')) {
    element.setAttributeNS(XLINK_NAMESPACE, attr, value);
  } else {
    element.setAttribute(attr, value);
  }
};

const get_dom_patches = (old_virtual_node = undefined, new_virtual_node = undefined, is_svg = false) => {
  // Both nodes are undefined or null
  if (!old_virtual_node && !new_virtual_node) return null;

  // Node removed
  if (!new_virtual_node) {
    return (node) => {
      if (node && node.parentNode) {
        node.parentNode.removeChild(node);
      }
      return undefined;
    };
  }

  // New node added
  if (!old_virtual_node) {
    return () => create_element(new_virtual_node, is_svg);
  }

  // Both nodes are strings (text nodes)
  if (typeof old_virtual_node === 'string' && typeof new_virtual_node === 'string') {
    if (old_virtual_node !== new_virtual_node) {
      return (node) => {
        if (node && node.nodeType === Node.TEXT_NODE) {
          node.textContent = new_virtual_node;
          return node;
        } else {
          return document.createTextNode(new_virtual_node);
        }
      };
    }
    return null;
  }

  // One node is a string, the other is an object
  if (typeof old_virtual_node !== typeof new_virtual_node) {
    return () => create_element(new_virtual_node, is_svg);
  }

  // Both nodes are objects (elements)
  if (old_virtual_node.tag_name !== new_virtual_node.tag_name) {
    return () => create_element(new_virtual_node, is_svg);
  }

  // At this point, we're dealing with two elements of the same type
  return (node) => {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) {
      return create_element(new_virtual_node, is_svg);
    }

    is_svg = is_svg || is_svg_tag(new_virtual_node.tag_name);

    // Update attributes
    update_attributes(node, old_virtual_node.attributes || {}, new_virtual_node.attributes || {}, is_svg);

    // Update special attributes
    if (old_virtual_node.component_id !== new_virtual_node.component_id) {
      if (new_virtual_node.component_id) {
        node.setAttribute('js-c', new_virtual_node.component_id);
      } else {
        node.removeAttribute('js-c');
      }
    }
    if (old_virtual_node.instance_id !== new_virtual_node.instance_id) {
      if (new_virtual_node.instance_id) {
        node.setAttribute('js-i', new_virtual_node.instance_id);
      } else {
        node.removeAttribute('js-i');
      }
    }

    // Update children
    const old_children = old_virtual_node.children || [];
    const new_children = new_virtual_node.children || [];
    const max_length = Math.max(old_children.length, new_children.length);

    for (let i = 0; i < max_length; i++) {
      const child_patch = get_dom_patches(old_children[i], new_children[i], is_svg);
      if (child_patch) {
        const child_node = node.childNodes[i];
        const result = child_patch(child_node);
        if (result !== undefined) {
          if (child_node) {
            if (result !== child_node) {
              node.replaceChild(result, child_node);
            }
          } else {
            node.appendChild(result);
          }
        }
      }
    }

    // Remove any extra old children
    while (node.childNodes.length > new_children.length) {
      node.removeChild(node.lastChild);
    }

    return node;
  };
};

export default get_dom_patches;