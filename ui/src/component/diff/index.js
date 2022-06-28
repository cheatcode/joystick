import render from '../render';
import elementPatchFunctions from './elementPatchFunctions';
import diffAttributes from './attributes';
import diffChildren from './children';

const getReplaceNodePatch = (newVirtualNode) => {
  return (node) => {
    const newDOMNode = newVirtualNode ? render(newVirtualNode) : null;

    if (node && newDOMNode) {
      node.replaceWith(newDOMNode);
    }

    return newDOMNode;
  };
};

const getRemoveNodePatch = () => {
  return (node) => {
    if (node) {
      node.remove();
    }
    
    return undefined;
  };
};

const diff = (oldVirtualNode = undefined, newVirtualNode = undefined) => {
  if (newVirtualNode === undefined) {
    return getRemoveNodePatch();
  }

  const isPatchingString = typeof oldVirtualNode === 'string' || typeof newVirtualNode === "string";
  const stringsDoNotMatch = isPatchingString && (oldVirtualNode !== newVirtualNode);

  if (isPatchingString && stringsDoNotMatch) {
    return getReplaceNodePatch(newVirtualNode);
  }

  const nodeTagNameChanged = oldVirtualNode.tagName !== newVirtualNode.tagName;

  if (nodeTagNameChanged) {
    return getReplaceNodePatch(newVirtualNode);
  }

  if (newVirtualNode.tagName === 'select') {
    return elementPatchFunctions.select(oldVirtualNode, newVirtualNode);
  }

  return (node) => {
    diffAttributes(oldVirtualNode.attributes, newVirtualNode.attributes)(node),
    diffChildren(oldVirtualNode.children, newVirtualNode.children)(node);
    return node;
  };
};

export default diff;