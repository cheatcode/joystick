import throwFrameworkError from "../../lib/throwFrameworkError";
import { isObject } from "../../lib/types";

const findComponentInTreeByField = (tree = {}, fieldValue = "", fieldName = 'id') => {
  try {
    const isTree = tree && tree.id;

    if (isObject(tree) && isTree) {
      const keys = Object.keys(tree);
  
      for (let key = 0; key < keys.length; key += 1) {
        const treeKey = keys[key];
        const treeValue = tree[treeKey];
  
        if (treeKey === fieldName && treeValue === fieldValue) {
          return tree;
        }
  
        if (treeKey === "children" && Array.isArray(treeValue)) {
          for (let childIndex = 0; childIndex < treeValue.length; childIndex += 1) {
            const childTree = treeValue[childIndex];
            const child = findComponentInTreeByField(childTree, fieldValue, fieldName);
            if (child !== null) {
              return child;
            }
          }
        }
      }
    }
  
    return null;
  } catch (exception) {
    throwFrameworkError('component.findComponentInTreeByField', exception);
  }
};

export default findComponentInTreeByField;
