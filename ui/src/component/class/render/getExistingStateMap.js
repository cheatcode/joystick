import throwFrameworkError from "../../../lib/throwFrameworkError";
import findComponentInTree from "../../findComponentInTree";

export default (componentInstance = {}) => {
  try {
    const componentInTree = findComponentInTree(window.joystick._internal.tree, componentInstance.id);
    return componentInTree?.children?.reduce((map = {}, childComponent) => {
      if (!map[childComponent?.instance?.id]) {
        map[childComponent?.instance?.id] = childComponent?.instance?.state;
      }

      return map;
    }, {});
  } catch (exception) {
    throwFrameworkError('component.render.getExistingStateMap', exception);
  }
};
