import throwFrameworkError from "../lib/throwFrameworkError";
import { isObject } from "../lib/types";

const getChildIdsFromTree = (tree = {}, childIds = [], fieldName = 'id', idToMatch = '') => {
  try {
    if (tree && isObject(tree)) {
      const treeKeys = Object.keys(tree);

      for (let key = 0; key < treeKeys.length; key += 1) {
        const treeKey = treeKeys[key];
        const treeValue = tree[treeKey];
  
        if (treeKey === fieldName && treeValue !== idToMatch) {
          childIds.push(treeValue);
        }
  
        if (treeKey === 'children') {
          const children = tree[treeKey];
          for (let child = 0; child < children?.length; child += 1) {
            const childTree = children[child] || {};
            getChildIdsFromTree(childTree, childIds, fieldName);
          }
        } 
      }
    }

    return childIds;
  } catch (exception) {
    throwFrameworkError('component.getChildIdsFromTree', exception);
  }
};

export default getChildIdsFromTree;
