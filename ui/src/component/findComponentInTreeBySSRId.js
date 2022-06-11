const isObject = (value) => {
  return !!(value && typeof value === "object" && !Array.isArray(value));
};

const findComponentInTreeBySSRId = (tree = {}, ssrId = "") => {
  const isTree = tree && tree.id;

  if (isObject(tree) && isTree) {
    const entries = Object.entries(tree);

    for (let i = 0; i < entries.length; i += 1) {
      const [treeKey, treeValue] = entries[i];

      if (treeKey === "instance" && treeValue?.ssrId === ssrId) {
        return tree;
      }

      if (treeKey === "children" && Array.isArray(treeValue)) {
        for (let c = 0; c < treeValue.length; c += 1) {
          const childTree = treeValue[c];
          const child = findComponentInTreeBySSRId(childTree, ssrId)
          if (child !== null) {
            return child;
          }
        }
      }
    }
  }

  return null;
};

export default findComponentInTreeBySSRId;
