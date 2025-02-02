import { special_attributes, set_special_attribute } from './special_attributes.js';

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

const set_attribute = (element, attr, value, is_svg) => {
  if (is_svg && attr.startsWith('xlink:')) {
    element.setAttributeNS(XLINK_NAMESPACE, attr, value);
    return;
  }

  const was_special = set_special_attribute(element, attr, value);
  if (!was_special) {
    element.setAttribute(attr, value);
  }
};

const update_attributes = (element, old_attrs, new_attrs, is_svg = false) => {
  const all_attrs = new Set([...Object.keys(old_attrs), ...Object.keys(new_attrs)]);
  
  for (const attr of all_attrs) {
    if (!(attr in new_attrs)) {
      if (special_attributes[attr]?.includes(element.tagName.toLowerCase())) {
        if (typeof old_attrs[attr] === 'boolean') {
          element[attr] = false;
        } else {
          element[attr] = null;
        }
      }
      element.removeAttribute(attr);
    } else if (old_attrs[attr] !== new_attrs[attr]) {
      set_attribute(element, attr, new_attrs[attr], is_svg);
    }
  }
};

const diff = (old_virtual_node = undefined, new_virtual_node = undefined, is_svg = false) => {
  if (!old_virtual_node && !new_virtual_node) return null;

  if (!new_virtual_node) {
    return (node) => {
      if (node && node.parentNode) {
        node.parentNode.removeChild(node);
      }
      return undefined;
    };
  }

  if (!old_virtual_node) {
    return () => create_element(new_virtual_node, is_svg);
  }

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

  if (typeof old_virtual_node !== typeof new_virtual_node) {
    return () => create_element(new_virtual_node, is_svg);
  }

  if (old_virtual_node.tag_name !== new_virtual_node.tag_name) {
    return () => create_element(new_virtual_node, is_svg);
  }

  return (node) => {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) {
      return create_element(new_virtual_node, is_svg);
    }

    is_svg = is_svg || is_svg_tag(new_virtual_node.tag_name);

    update_attributes(node, old_virtual_node.attributes || {}, new_virtual_node.attributes || {}, is_svg);

    const old_children = old_virtual_node.children || [];
    const new_children = new_virtual_node.children || [];
    const max_length = Math.max(old_children.length, new_children.length);

    const old_keys = new Map();
    const new_keys = new Map();

    old_children.forEach((child, index) => {
      if (child.attributes && child.attributes.key) {
        old_keys.set(child.attributes.key, index);
      }
    });

    new_children.forEach((child, index) => {
      if (child.attributes && child.attributes.key) {
        new_keys.set(child.attributes.key, index);
      }
    });

    for (let i = 0; i < max_length; i++) {
      const old_child = old_children[i];
      const new_child = new_children[i];
      
      let child_node = node.childNodes[i];
      let child_patch;

      if (old_child && new_child && old_child.attributes && new_child.attributes &&
          old_child.attributes.key && new_child.attributes.key) {
        if (old_child.attributes.key !== new_child.attributes.key) {
          child_patch = () => create_element(new_child, is_svg);
        } else {
          child_patch = diff(old_child, new_child, is_svg);
        }
      } else {
        child_patch = diff(old_child, new_child, is_svg);
      }

      if (child_patch) {
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

    while (node.childNodes.length > new_children.length) {
      node.removeChild(node.lastChild);
    }

    return node;
  };
};

export default diff;