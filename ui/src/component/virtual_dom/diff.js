import render_virtual_dom_to_dom from './render_virtual_dom_to_dom.js';

const create_element = (virtual_node) => {
  if (typeof virtual_node === 'string') {
    return document.createTextNode(virtual_node);
  }
  const element = document.createElement(virtual_node.tag_name);
  for (const [attr, value] of Object.entries(virtual_node.attributes || {})) {
    element.setAttribute(attr, value);
  }
  if (virtual_node.component_id) {
    element.setAttribute('js-c', virtual_node.component_id);
  }
  if (virtual_node.instance_id) {
    element.setAttribute('js-i', virtual_node.instance_id);
  }
  return element;
};

const diff_attributes = (node, old_attributes, new_attributes) => {
  const patches = [];

  // Remove old attributes
  for (const attr in old_attributes) {
    if (!(attr in new_attributes)) {
      patches.push(() => node.removeAttribute(attr));
    }
  }

  // Set new or changed attributes
  for (const attr in new_attributes) {
    if (old_attributes[attr] !== new_attributes[attr]) {
      patches.push(() => node.setAttribute(attr, new_attributes[attr]));
    }
  }

  return patches;
};

const get_dom_patches = (old_virtual_node = undefined, new_virtual_node = undefined) => {
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

  // Both nodes are text nodes
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

  // One node is a text node and the other isn't
  if (typeof old_virtual_node !== typeof new_virtual_node) {
    return () => create_element(new_virtual_node);
  }

  // Both nodes are element nodes
  if (old_virtual_node.tag_name !== new_virtual_node.tag_name) {
    return () => create_element(new_virtual_node);
  }

  // At this point, we're dealing with two elements of the same type
  return (node) => {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) {
      return create_element(new_virtual_node);
    }

    const patches = [];

    // Diff regular attributes
    patches.push(...diff_attributes(node, old_virtual_node.attributes || {}, new_virtual_node.attributes || {}));

    // Handle component_id
    if (old_virtual_node.component_id !== new_virtual_node.component_id) {
      if (new_virtual_node.component_id) {
        patches.push(() => node.setAttribute('js-c', new_virtual_node.component_id));
      } else {
        patches.push(() => node.removeAttribute('js-c'));
      }
    }

    // Handle instance_id
    if (old_virtual_node.instance_id !== new_virtual_node.instance_id) {
      if (new_virtual_node.instance_id) {
        patches.push(() => node.setAttribute('js-i', new_virtual_node.instance_id));
      } else {
        patches.push(() => node.removeAttribute('js-i'));
      }
    }

    // Diff children
    const old_children = old_virtual_node.children || [];
    const new_children = new_virtual_node.children || [];
    const child_patches = [];

    for (let i = 0; i < Math.max(old_children.length, new_children.length); i++) {
      child_patches.push(get_dom_patches(old_children[i], new_children[i]));
    }

    patches.push(() => {
      for (let i = 0; i < child_patches.length; i++) {
        const child_patch = child_patches[i];
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
      // Remove any extra children
      while (node.childNodes.length > new_children.length) {
        node.removeChild(node.lastChild);
      }
    });

    // Apply all patches
    for (const patch of patches) {
      patch();
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
