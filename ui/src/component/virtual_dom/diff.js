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

    // Update children
    const old_children = old_virtual_node.children || [];
    const new_children = new_virtual_node.children || [];

    const get_key = (child) => child.attributes && child.attributes.key !== undefined ? child.attributes.key : null;

    const old_keys = new Map(old_children.map((child, index) => [get_key(child) || index, child]));
    const new_keys = new Map(new_children.map((child, index) => [get_key(child) || index, child]));

    const patches = [];

    // Remove old children that are not in the new set
    old_children.forEach((old_child, index) => {
      const key = get_key(old_child) || index;
      if (!new_keys.has(key)) {
        patches.push(() => {
          const child_to_remove = node.childNodes[index];
          if (child_to_remove) {
            node.removeChild(child_to_remove);
          }
        });
      }
    });

    let old_index = 0;
    new_children.forEach((new_child, new_index) => {
      const new_key = get_key(new_child) || new_index;
      const old_child = old_keys.get(new_key);

      if (!old_child) {
        // Add new child
        patches.push(() => {
          const new_node = create_element(new_child, is_svg);
          if (new_index < node.childNodes.length) {
            node.insertBefore(new_node, node.childNodes[new_index]);
          } else {
            node.appendChild(new_node);
          }
        });
      } else {
        // Update existing child
        const child_patch = get_dom_patches(old_child, new_child, is_svg);
        if (child_patch) {
          patches.push(() => {
            const child_node = node.childNodes[old_index];
            if (child_node) {
              child_patch(child_node);
            }
          });
        }

        // Move the child if necessary
        if (old_index !== new_index) {
          patches.push(() => {
            const child_node = node.childNodes[old_index];
            const reference_node = node.childNodes[new_index];
            if (child_node && reference_node && child_node !== reference_node) {
              node.insertBefore(child_node, reference_node);
            }
          });
        }
        old_index++;
      }
    });

    // Apply all patches
    patches.forEach(patch => patch());

    // Remove any remaining old children
    while (node.childNodes.length > new_children.length) {
      node.removeChild(node.lastChild);
    }

    return node;
  };
};

export default get_dom_patches;