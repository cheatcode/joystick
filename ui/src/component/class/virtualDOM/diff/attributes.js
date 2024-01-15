import isValidAttributeName from '../../../../lib/isValidAttributeName.js';

const diffAttributes = (oldAttributes = {}, newAttributes = {}) => {
  const patches = [];

  for (const [attributeKey, attributeValue] of Object.entries(newAttributes)) {
    patches.push((node) => {
      if (node && node.setAttribute && isValidAttributeName(attributeKey)) {
        node.setAttribute(attributeKey, attributeValue);
      }

      return node;
    });
  }

  for (const attributeKey in oldAttributes) {
    if (!(attributeKey in newAttributes)) {
      patches.push((node) => {
        if (node && node.removeAttribute) {
          node.removeAttribute(attributeKey);
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

export default diffAttributes;
