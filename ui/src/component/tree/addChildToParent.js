import findComponentInTreeByField from "./findComponentInTreeByField";

export default (parentInstanceId = '', child = {}, tree = null) => {
  const componentInTree = findComponentInTreeByField(tree || window.joystick._internal.tree, parentInstanceId, 'instanceId');
  
  if (componentInTree) {
    componentInTree.children = [
      ...(componentInTree.children || []),
      child,
    ];
  }
};