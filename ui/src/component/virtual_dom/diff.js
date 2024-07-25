import render_virtual_dom_to_dom from './render_virtual_dom_to_dom.js';

const get_replace_node_patch = (new_virtual_node) => {
  return (node) => {
    const new_dom_node = new_virtual_node ? render_virtual_dom_to_dom(new_virtual_node) : null;

    if (node && node.parentNode && new_dom_node) {
      node.parentNode.replaceChild(new_dom_node, node);
    }

    return new_dom_node;
  };
};

const get_remove_node_patch = () => {
  return (node) => {
    if (node && node.parentNode) {
      node.parentNode.removeChild(node);
    }
    
    return undefined;
  };
};

const diff_attributes = (old_attributes, new_attributes) => {
  return (node) => {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) return;

    // Remove old attributes
    for (const attr in old_attributes) {
      if (!(attr in new_attributes)) {
        node.removeAttribute(attr);
      }
    }

    // Set new or changed attributes
    for (const attr in new_attributes) {
      if (old_attributes[attr] !== new_attributes[attr]) {
        node.setAttribute(attr, new_attributes[attr]);
      }
    }
  };
};

const diff_children = (old_children, new_children) => {
  return (node) => {
    if (!node) return;

    const patches = [];
    const max_length = Math.max(old_children.length, new_children.length);

    for (let i = 0; i < max_length; i += 1) {
      patches.push(get_dom_patches(old_children[i], new_children[i]));
    }

    for (let i = 0; i < patches.length; i += 1) {
      const child_node = node.childNodes[i];
      const patch = patches[i];

      if (patch) {
        const result = patch(child_node);
        if (result !== undefined && result !== child_node) {
          // If the patch returned a new node, replace the old one
          if (child_node && child_node.parentNode) {
            child_node.parentNode.replaceChild(result, child_node);
          } else if (!child_node) {
            node.appendChild(result);
          }
        }
      }
    }

    // Remove any extra old children
    while (node.childNodes.length > new_children.length) {
      node.removeChild(node.lastChild);
    }
  };
};

const get_dom_patches = (old_virtual_node = undefined, new_virtual_node = undefined) => {
  if (old_virtual_node === undefined && new_virtual_node === undefined) {
    return null;
  }

  if (old_virtual_node === undefined) {
    return (node) => render_virtual_dom_to_dom(new_virtual_node);
  }

  if (new_virtual_node === undefined) {
    return get_remove_node_patch();
  }

  const is_text_node = typeof old_virtual_node === 'string' || typeof new_virtual_node === "string";

  if (is_text_node) {
    if (old_virtual_node !== new_virtual_node) {
      return (node) => {
        const new_content = typeof new_virtual_node === 'string' ? new_virtual_node : '';
        if (node && node.nodeType === Node.TEXT_NODE) {
          node.textContent = new_content;
          return node;
        } else {
          const new_text_node = document.createTextNode(new_content);
          if (node && node.parentNode) {
            node.parentNode.replaceChild(new_text_node, node);
          }
          return new_text_node;
        }
      };
    }
    return null;
  }

  const node_type_changed = old_virtual_node.tag_name !== new_virtual_node.tag_name;

  if (node_type_changed) {
    return get_replace_node_patch(new_virtual_node);
  }

  return (node) => {
    if (!node) return node;

    diff_attributes(old_virtual_node.attributes || {}, new_virtual_node.attributes || {})(node);

    // Handle component_id and instance_id
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

    diff_children(old_virtual_node.children || [], new_virtual_node.children || [])(node);

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
