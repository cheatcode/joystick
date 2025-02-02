import is_valid_attribute_name from '../dom/is_valid_attribute_name.js';
import { special_attributes, set_special_attribute } from './special_attributes.js';

const diff_attributes = (old_attributes = {}, new_attributes = {}) => {
  const patches = [];

  for (const [attribute_key, attribute_value] of Object.entries(new_attributes)) {
    patches.push((node) => {
      if (node) {
        const was_special = set_special_attribute(node, attribute_key, attribute_value);
        if (!was_special && is_valid_attribute_name(attribute_key)) {
          node.setAttribute(attribute_key, attribute_value);
        }
      }
      return node;
    });
  }

  for (const attribute_key in old_attributes) {
    if (!(attribute_key in new_attributes)) {
      patches.push((node) => {
        if (node) {
          if (special_attributes[attribute_key]?.includes(node.tagName.toLowerCase())) {
            if (typeof old_attributes[attribute_key] === 'boolean') {
              node[attribute_key] = false;
            } else {
              node[attribute_key] = null;
            }
          }
          node.removeAttribute(attribute_key);
        }
        return node;
      });
    }
  }

  return (node) => {
    for (const patch of patches) {
      if (patch && typeof patch === "function") {
        patch(node);
      }
    }
  };
};

export default diff_attributes;