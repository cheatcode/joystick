const create_element = (tag_name) => document.createElement(tag_name);
const create_text_node = (text) => document.createTextNode(text);

const create_dom_node = (virtual_dom_node) => {
  if (typeof virtual_dom_node === 'string') {
    return create_text_node(virtual_dom_node);
  }
  const element = create_element(virtual_dom_node.tag_name);
  const attrs = Object.entries(virtual_dom_node.attributes || {});
  for (let i = 0; i < attrs.length; i += 1) {
    const [attr, value] = attrs[i];
    element.setAttribute(attr, value);
  }
  if (virtual_dom_node.component_id) {
    element.setAttribute('js-c', virtual_dom_node.component_id);
  }
  if (virtual_dom_node.instance_id) {
    element.setAttribute('js-i', virtual_dom_node.instance_id);
  }
  const children = virtual_dom_node.children || [];
  for (let i = 0; i < children.length; i += 1) {
    element.appendChild(create_dom_node(children[i]));
  }
  return element;
};

const diff_attributes = (old_attributes = {}, new_attributes = {}) => {
  const patches = [];

  const new_attrs = Object.entries(new_attributes);
  for (let i = 0; i < new_attrs.length; i += 1) {
    const [attr, value] = new_attrs[i];
    if (old_attributes[attr] !== value) {
      patches.push(node => {
        if (node && node.setAttribute) {
          node.setAttribute(attr, value);
        }
      });
    }
  }

  const old_attrs = Object.keys(old_attributes);
  for (let i = 0; i < old_attrs.length; i += 1) {
    const attr = old_attrs[i];
    if (!(attr in new_attributes)) {
      patches.push(node => {
        if (node && node.removeAttribute) {
          node.removeAttribute(attr);
        }
      });
    }
  }

  if (patches.length === 0) return null;

  return node => {
    if (node) {
      for (let i = 0; i < patches.length; i += 1) {
        patches[i](node);
      }
    }
  };
};

const diff_children = (old_virtual_dom_children = [], new_virtual_dom_children = []) => {
  const patches = [];

  for (let i = 0; i < old_virtual_dom_children.length; i += 1) {
    patches.push(get_dom_patches(old_virtual_dom_children[i], new_virtual_dom_children[i]));
  }

  for (let i = old_virtual_dom_children.length; i < new_virtual_dom_children.length; i += 1) {
    patches.push((node) => {
      if (node && node.appendChild) {
        node.appendChild(create_dom_node(new_virtual_dom_children[i]));
      }
    });
  }

  for (let i = new_virtual_dom_children.length; i < old_virtual_dom_children.length; i += 1) {
    patches.push((node) => {
      if (node && node.childNodes && node.childNodes[i] && node.removeChild) {
        node.removeChild(node.childNodes[i]);
      }
    });
  }

  const filtered_patches = patches.filter(Boolean);
  if (filtered_patches.length === 0) return null;

  return node => {
    if (node && node.childNodes) {
      for (let i = 0; i < filtered_patches.length; i += 1) {
        filtered_patches[i](node.childNodes[i] || node);
      }
    }
  };
};

const get_dom_patches = (old_virtual_dom_node = null, new_virtual_dom_node = null) => {
  if (!old_virtual_dom_node && !new_virtual_dom_node) return null;

  if (!old_virtual_dom_node || !new_virtual_dom_node) {
    return (node) => {
      if (node && node.parentNode) {
        if (!new_virtual_dom_node) {
          node.parentNode.removeChild(node);
        } else {
          node.parentNode.replaceChild(create_dom_node(new_virtual_dom_node), node);
        }
      }
    };
  }

  if (typeof old_virtual_dom_node === 'string' && typeof new_virtual_dom_node === 'string') {
    if (old_virtual_dom_node !== new_virtual_dom_node) {
      return (node) => {
        if (node) {
          if (node.nodeType === Node.TEXT_NODE) {
            node.nodeValue = new_virtual_dom_node;
          } else if (node.textContent !== undefined) {
            node.textContent = new_virtual_dom_node;
          }
        }
      };
    }
    return null;
  }

  if (typeof old_virtual_dom_node !== typeof new_virtual_dom_node || 
      (old_virtual_dom_node.tag_name && new_virtual_dom_node.tag_name && old_virtual_dom_node.tag_name !== new_virtual_dom_node.tag_name)) {
    return (node) => {
      if (node && node.parentNode) {
        node.parentNode.replaceChild(create_dom_node(new_virtual_dom_node), node);
      }
    };
  }

  const patch_functions = [];

  if (new_virtual_dom_node.attributes) {
    const attribute_patch = diff_attributes(old_virtual_dom_node.attributes, new_virtual_dom_node.attributes);
    if (attribute_patch) patch_functions.push(attribute_patch);
  }

  if (old_virtual_dom_node.component_id !== new_virtual_dom_node.component_id) {
    patch_functions.push(node => {
      if (node && node.setAttribute && node.removeAttribute) {
        if (new_virtual_dom_node.component_id) {
          node.setAttribute('js-c', new_virtual_dom_node.component_id);
        } else {
          node.removeAttribute('js-c');
        }
      }
    });
  }

  if (old_virtual_dom_node.instance_id !== new_virtual_dom_node.instance_id) {
    patch_functions.push(node => {
      if (node && node.setAttribute && node.removeAttribute) {
        if (new_virtual_dom_node.instance_id) {
          node.setAttribute('js-i', new_virtual_dom_node.instance_id);
        } else {
          node.removeAttribute('js-i');
        }
      }
    });
  }

  if (new_virtual_dom_node.children) {
    const children_patch = diff_children(old_virtual_dom_node.children, new_virtual_dom_node.children);
    if (children_patch) patch_functions.push(children_patch);
  }

  if (patch_functions.length === 0) return null;

  return (node) => {
    if (node) {
      for (let i = 0; i < patch_functions.length; i += 1) {
        patch_functions[i](node);
      }
    }
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
