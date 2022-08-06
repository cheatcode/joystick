import throwFrameworkError from "../../../lib/throwFrameworkError";
import findComponentInTreeByField from "../../tree/findComponentInTreeByField";

export default (componentInstance = {}) => {
  try {
    const baseMap = {};
    const componentInTree = findComponentInTreeByField(window.joystick._internal.tree, componentInstance.id);

    if (componentInTree) {
      baseMap[componentInTree?.instance?.id] = componentInTree?.instance?.props;
    }
    
    return componentInTree?.children?.reduce((map = {}, childComponent) => {
      if (!map[childComponent?.instance?.id]) {
        map[childComponent?.instance?.id] = childComponent?.instance?.props;
      }

      return map;
    }, baseMap);
  } catch (exception) {
    throwFrameworkError('component.render.getExistingPropsMap', exception);
  }
};
