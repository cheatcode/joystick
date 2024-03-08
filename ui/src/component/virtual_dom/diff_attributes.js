import is_valid_attribute_name from '../dom/is_valid_attribute_name.js';

const diff_attributes = (old_attributes = {}, new_attributes = {}) => {
  const patches = [];

  for (const [attribute_key, attribute_value] of Object.entries(new_attributes)) {
    patches.push((node) => {
      if (node && node.setAttribute && is_valid_attribute_name(attribute_key)) {
        node.setAttribute(attribute_key, attribute_value);
      }

      return node;
    });
  }

  for (const attribute_key in old_attributes) {
    if (!(attribute_key in new_attributes)) {
      patches.push((node) => {
        if (node && node.removeAttribute) {
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
