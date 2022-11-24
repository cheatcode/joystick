import throwFrameworkError from "../../../lib/throwFrameworkError";
import findComponentInTreeByField from "../../tree/findComponentInTreeByField";

export default (componentInstance = {}) => {
  try {
    const baseMap = {};
    const componentInTree = findComponentInTreeByField(window.joystick._internal.tree, componentInstance.instanceId);

    if (componentInTree) {
      baseMap[componentInTree?.instance?.instanceId] = componentInTree?.instance?.props;
    }
    
    return componentInTree?.children?.reduce((map = {}, childComponent) => {
      if (!map[childComponent?.instance?.instanceId]) {
        map[childComponent?.instance?.instanceId] = childComponent?.instance?.props;
      }

      return map;
    }, baseMap);
  } catch (exception) {
    throwFrameworkError('component.render.getExistingPropsMap', exception);
  }
};
