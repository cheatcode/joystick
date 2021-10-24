import render from "./render";

const zip = (patches, nodes) => {
  const zipped = [];
  for (let i = 0; i < Math.max(patches.length, nodes.length); i++) {
    zipped.push([patches[i], nodes[i]]);
  }
  return zipped;
};

const diffAttributes = (oldAttributes, newAttributes) => {
  const patches = [];

  for (const [attributeKey, attributeValue] of Object.entries(newAttributes)) {
    patches.push((node) => {
      if (node) {
        node.setAttribute(attributeKey, attributeValue);
      }

      return node;
    });
  }

  for (const attributeKey in oldAttributes) {
    if (!(attributeKey in newAttributes)) {
      patches.push((node) => {
        if (node) {
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

const diffChildren = (oldVChildren, newVChildren) => {
  const childPatches = [];
  oldVChildren.forEach((oldVChild, i) => {
    childPatches.push(diff(oldVChild, newVChildren[i]));
  });

  const additionalPatches = [];
  for (const additionalVChild of newVChildren.slice(oldVChildren.length)) {
    additionalPatches.push((node) => {
      node.appendChild(render(additionalVChild));
      return node;
    });
  }

  return ($parent) => {
    if ($parent) {
      for (const [patch, child] of zip(childPatches, $parent.childNodes)) {
        if (patch && typeof patch === "function") {
          patch(child);
        }
      }

      for (const patch of additionalPatches) {
        if (patch && typeof patch === "function") {
          patch($parent);
        }
      }
    }

    return $parent;
  };
};

const diff = (vOldNode, vNewNode) => {
  if (vNewNode === undefined) {
    return (node) => {
      node.remove();
      return undefined;
    };
  }

  if (typeof vOldNode === "string" || typeof vNewNode === "string") {
    if (vOldNode !== vNewNode) {
      return (node) => {
        const $newNode = render(vNewNode);
        node.replaceWith($newNode);
        return $newNode;
      };
    } else {
      return (node) => undefined;
    }
  }

  if (vOldNode.tagName !== vNewNode.tagName) {
    return (node) => {
      const $newNode = render(vNewNode);
      node.replaceWith($newNode);
      return $newNode;
    };
  }

  const patchAttributes = diffAttributes(
    vOldNode.attributes,
    vNewNode.attributes
  );
  const patchChildren = diffChildren(vOldNode.children, vNewNode.children);

  return (node) => {
    patchAttributes(node);
    patchChildren(node);
    return node;
  };
};

export default diff;
