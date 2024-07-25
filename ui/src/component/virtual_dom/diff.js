// DOM utility functions
const create_element = (type) => document.createElement(type);
const create_text_node = (text) => document.createTextNode(text);

const create_dom_node = (virtual_dom_node) => {
  if (typeof virtual_dom_node === 'string') {
    return create_text_node(virtual_dom_node);
  }
  const element = create_element(virtual_dom_node.type);
  const props = Object.entries(virtual_dom_node.props || {});
  for (let i = 0; i < props.length; i += 1) {
    const [attr, value] = props[i];
    element.setAttribute(attr, value);
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
      patches.push(node => node.setAttribute(attr, value));
    }
  }

  const old_attrs = Object.keys(old_attributes);
  for (let i = 0; i < old_attrs.length; i += 1) {
    const attr = old_attrs[i];
    if (!(attr in new_attributes)) {
      patches.push(node => node.removeAttribute(attr));
    }
  }

  if (patches.length === 0) return null;

  return node => {
    for (let i = 0; i < patches.length; i += 1) {
      patches[i](node);
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
      node.appendChild(create_dom_node(new_virtual_dom_children[i]));
    });
  }

  for (let i = new_virtual_dom_children.length; i < old_virtual_dom_children.length; i += 1) {
    patches.push((node) => {
      node.removeChild(node.childNodes[i]);
    });
  }

  const filtered_patches = patches.filter(Boolean);
  if (filtered_patches.length === 0) return null;

  return node => {
    for (let i = 0; i < filtered_patches.length; i += 1) {
      filtered_patches[i](node.childNodes[i] || node);
    }
  };
};

const get_dom_patches = (old_virtual_dom_node = null, new_virtual_dom_node = null) => {
  if (!old_virtual_dom_node && !new_virtual_dom_node) return null;

  if (!old_virtual_dom_node || !new_virtual_dom_node) {
    return (node) => {
      if (node.parentNode) {
        if (!new_virtual_dom_node) {
          node.parentNode.removeChild(node);
        } else {
          node.parentNode.replaceChild(create_dom_node(new_virtual_dom_node), node);
        }
      }
    };
  }

  if (typeof old_virtual_dom_node === 'string' && typeof new_virtual_dom_node === 'string' && old_virtual_dom_node !== new_virtual_dom_node) {
    return (node) => {
      node.nodeValue = new_virtual_dom_node;
    };
  }

  if (typeof old_virtual_dom_node !== typeof new_virtual_dom_node || old_virtual_dom_node.type !== new_virtual_dom_node.type) {
    return (node) => {
      if (node.parentNode) {
        node.parentNode.replaceChild(create_dom_node(new_virtual_dom_node), node);
      }
    };
  }

  const patch_functions = [];

  const attribute_patch = diff_attributes(old_virtual_dom_node.props || {}, new_virtual_dom_node.props || {});
  if (attribute_patch) patch_functions.push(attribute_patch);

  const children_patch = diff_children(old_virtual_dom_node.children || [], new_virtual_dom_node.children || []);
  if (children_patch) patch_functions.push(children_patch);

  if (patch_functions.length === 0) return null;

  return (node) => {
    for (let i = 0; i < patch_functions.length; i += 1) {
      patch_functions[i](node);
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
