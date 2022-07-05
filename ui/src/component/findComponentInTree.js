import throwFrameworkError from "../lib/throwFrameworkError";
import { isObject } from "../lib/types";

const findComponentInTree = (tree = {}, componentId = "", callback = null) => {
  try {
    const isTree = tree && tree.id;

    if (isObject(tree) && isTree) {
      const keys = Object.keys(tree);
  
      for (let key = 0; key < keys.length; key += 1) {
        const treeKey = keys[key];
        const treeValue = tree[treeKey];
  
        if (treeKey === "id" && treeValue === componentId) {
          return tree;
        }
  
        if (treeKey === "children" && Array.isArray(treeValue)) {
          for (let childIndex = 0; childIndex < treeValue.length; childIndex += 1) {
            const childTree = treeValue[childIndex];
            const child = findComponentInTree(childTree, componentId, callback);
            if (child !== null) {
              return child;
            }
          }
        }
      }
    }
  
    return null;
  } catch (exception) {
    throwFrameworkError('component.findComponentInTree', exception);
  }
};

export default findComponentInTree;
