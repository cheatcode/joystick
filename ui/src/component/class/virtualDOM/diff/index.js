import render from '../renderTreeToDOM';
import elementPatchFunctions from './elementPatchFunctions';
import diffAttributes from './attributes';
import diffChildren from './children';

const getReplaceNodePatch = (newVirtualNode, oldVirtualNode) => {
  return (node) => {
    const newDOMNode = newVirtualNode ? render(newVirtualNode) : null;

    if (node) {
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
  if (oldVirtualNode === undefined || newVirtualNode === undefined) {
    return getRemoveNodePatch();
  }

  const isPatchingString = typeof oldVirtualNode === 'string' || typeof newVirtualNode === "string";

  if (isPatchingString) {
    return getReplaceNodePatch(newVirtualNode, oldVirtualNode);
  }

  const nodeTagNameChanged = oldVirtualNode.tagName !== newVirtualNode.tagName;

  if (nodeTagNameChanged) {
    return getReplaceNodePatch(newVirtualNode);
  }

  if (newVirtualNode.tagName === 'select') {
    return elementPatchFunctions.select(oldVirtualNode, newVirtualNode);
  }

  if (newVirtualNode.tagName === 'code') {
    return getReplaceNodePatch(newVirtualNode, oldVirtualNode);
  }

  return (node) => {
    diffAttributes(oldVirtualNode.attributes, newVirtualNode.attributes)(node),
    diffChildren(oldVirtualNode.children, newVirtualNode.children)(node);
    return node;
  };
};

export default diff;