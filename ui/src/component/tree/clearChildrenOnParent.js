import findComponentInTreeByField from "./findComponentInTreeByField";

export default (instanceId = '', tree = null) => {
  const componentInTree = findComponentInTreeByField(tree || window.joystick._internal.tree, instanceId, 'instanceId');
  
  if (componentInTree) {
    componentInTree.children = [];
  }
};