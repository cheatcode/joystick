import findComponentInTreeByField from "./findComponentInTreeByField";

export default (instanceId = '', instance = {}, tree = null) => {
  const componentInTree = findComponentInTreeByField(tree || window.joystick._internal.tree, instanceId, 'instanceId');

  if (componentInTree) {
    componentInTree.instanceId = instance?.instanceId;
    componentInTree.instance = instance;
  }
};