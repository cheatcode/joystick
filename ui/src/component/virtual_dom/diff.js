import render_virtual_dom_to_dom from './render_virtual_dom_to_dom.js';

const create_element = (virtual_node) => {
  if (typeof virtual_node === 'string') {
    return document.createTextNode(virtual_node);
  }
  const element = document.createElement(virtual_node.tag_name);
  update_attributes(element, {}, virtual_node.attributes || {});
  if (virtual_node.component_id) element.setAttribute('js-c', virtual_node.component_id);
  if (virtual_node.instance_id) element.setAttribute('js-i', virtual_node.instance_id);
  (virtual_node.children || []).forEach(child => {
    element.appendChild(create_element(child));
  });
  return element;
};

const update_attributes = (element, old_attrs, new_attrs) => {
  // Remove old attributes
  for (const attr in old_attrs) {
    if (!(attr in new_attrs)) {
      element.removeAttribute(attr);
    }
  }
  // Set new or changed attributes
  for (const attr in new_attrs) {
    if (old_attrs[attr] !== new_attrs[attr]) {
      element.setAttribute(attr, new_attrs[attr]);
    }
  }
};

const get_dom_patches = (old_virtual_node = undefined, new_virtual_node = undefined) => {
  if (old_virtual_node === undefined && new_virtual_node === undefined) {
    return null;
  }

  // Node removed
  if (new_virtual_node === undefined) {
    return (node) => {
      if (node && node.parentNode) {
        node.parentNode.removeChild(node);
      }
      return undefined;
    };
  }

  // New node added
  if (old_virtual_node === undefined) {
    return () => create_element(new_virtual_node);
  }

  // Both nodes are strings (text nodes)
  if (typeof old_virtual_node === 'string' && typeof new_virtual_node === 'string') {
    if (old_virtual_node !== new_virtual_node) {
      return (node) => {
        if (node && node.nodeType === Node.TEXT_NODE) {
          node.textContent = new_virtual_node;
        } else {
          return document.createTextNode(new_virtual_node);
        }
        return node;
      };
    }
    return null;
  }

  // Nodes are of different types
  if (typeof old_virtual_node !== typeof new_virtual_node ||
      (typeof old_virtual_node === 'object' && old_virtual_node.tag_name !== new_virtual_node.tag_name)) {
    return () => create_element(new_virtual_node);
  }

  // At this point, we're dealing with two elements of the same type
  return (node) => {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) {
      return create_element(new_virtual_node);
    }

    // Update attributes
    update_attributes(node, old_virtual_node.attributes || {}, new_virtual_node.attributes || {});

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
      const child_patch = get_dom_patches(old_children[i], new_children[i]);
      if (child_patch) {
        const child_node = node.childNodes[i];
        const result = child_patch(child_node);
        if (result !== undefined) {
          if (child_node) {
            node.replaceChild(result, child_node);
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

// import diff_attributes from './diff_attributes.js';
// import diff_children from './diff_children.js';
// import element_patch_functions from './element_patch_functions.js';
// import render_virtual_dom_to_dom from './render_virtual_dom_to_dom.js';

// const get_replace_node_patch = (new_virtual_node) => {
//   return (node) => {
//     const new_dom_node = new_virtual_node ? render_virtual_dom_to_dom(new_virtual_node) : null;

//     if (node && new_dom_node) {
//       node.replaceWith(new_dom_node);
//     }

//     return new_dom_node;
//   };
// };

// const get_remove_node_patch = () => {
//   return (node) => {
//     if (node) {
//       node.remove();
//     }
    
//     return undefined;
//   };
// };

// const diff = (old_virtual_node = undefined, new_virtual_node = undefined) => {
//   if (old_virtual_node === undefined || new_virtual_node === undefined) {    
//     return get_remove_node_patch();
//   }

//   const is_patching_string = typeof old_virtual_node === 'string' || typeof new_virtual_node === "string";

//   if (is_patching_string) {
//     return get_replace_node_patch(new_virtual_node);
//   }

//   const node_tag_name_changed = old_virtual_node.tag_name !== new_virtual_node.tag_name;

//   if (node_tag_name_changed) {
//     return get_replace_node_patch(new_virtual_node);
//   }

//   if (new_virtual_node.tag_name === 'select') {
//     return element_patch_functions.select(old_virtual_node, new_virtual_node);
//   }

//   if (['pre', 'code'].includes(new_virtual_node.tag_name)) {
//     return get_replace_node_patch(new_virtual_node);
//   }

//   return (node) => {
//     diff_attributes(old_virtual_node.attributes, new_virtual_node.attributes)(node);
//     diff_children(old_virtual_node.children, new_virtual_node.children)(node);

//     return node;
//   };
// };

// export default diff;
