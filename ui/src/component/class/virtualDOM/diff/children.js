import mapPatchFunctionsToNodes from './mapPatchFunctionsToNodes.js';
import diffVirtualDOMNodes from './index.js';
import render from '../renderTreeToDOM';

const appendNewChildren = (newChildrenFunctions = [], parentNode) => {
  newChildrenFunctions.forEach((patchFunction) => {
    if (patchFunction && typeof patchFunction === "function") {
      patchFunction(parentNode);
    }
  });
};

const patchChildNodes = (patchNodeMap = []) => {
  patchNodeMap.forEach(([patchFunction, childNode]) => {
    if (patchFunction && typeof patchFunction === "function") {
      patchFunction(childNode);
    }
  });
};

const getNewChildrenFunctions = (oldVirtualChildren = [], newVirtualChildren = []) => {
  const newChildrenFunctions = [];
  const newChildren = newVirtualChildren.slice(oldVirtualChildren.length);

  console.log({
    oldVirtualChildren,
    newVirtualChildren,
    newChildren,
  });

  newChildren.forEach((newChild) => {
    const newChildFunction = (node) => {
      const newDOMNode = render(newChild);
      node.appendChild(newDOMNode);
      return node;
    };

    newChildrenFunctions.push(newChildFunction);
  });

  return newChildrenFunctions;
};

const getPatchesForExistingChildren = (oldVirtualChildren = [], newVirtualChildren = []) => {
  const childPatchFunctions = [];

  oldVirtualChildren.forEach((oldVirtualChild, index) => {
    const childPatchFunction = diffVirtualDOMNodes(
      oldVirtualChild,
      newVirtualChildren[index],
    );
  
    childPatchFunctions.push(childPatchFunction);
  });

  return childPatchFunctions;
};

const diffChildren = (oldVirtualChildren = [], newVirtualChildren = []) => {
  const childPatchFunctions = getPatchesForExistingChildren(oldVirtualChildren, newVirtualChildren);
  const newChildrenFunctions = getNewChildrenFunctions(oldVirtualChildren, newVirtualChildren);

  return (parentNode) => {
    if (parentNode) {
      const patchNodeMap = mapPatchFunctionsToNodes(childPatchFunctions, parentNode.childNodes);
      patchChildNodes(patchNodeMap);
      appendNewChildren(newChildrenFunctions, parentNode);
    }

    return parentNode;
  };
};

export default diffChildren;