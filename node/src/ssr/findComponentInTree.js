const isObject = (value) => {
  return !!(value && typeof value === "object" && !Array.isArray(value));
};

const findComponentInTree = (tree = {}, componentId = "", callback = {}) => {
  const isTree = tree && tree.id;

  if (isObject(tree) && isTree) {
    const entries = Object.entries(tree || {});

    for (let i = 0; i < entries.length; i += 1) {
      const [treeKey, treeValue] = entries[i];

      if (treeKey === "id" && treeValue === componentId) {
        return tree;
      }

      if (treeKey === "children" && Array.isArray(treeValue)) {
        for (let c = 0; c < treeValue.length; c += 1) {
          const childTree = treeValue[c];
          const child = findComponentInTree(childTree, componentId, callback);
          if (child !== null) {
            return child;
          }
        }
      }
    }
  }

  return null;
};

export default findComponentInTree;
