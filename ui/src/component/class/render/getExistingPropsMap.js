import throwFrameworkError from "../../../lib/throwFrameworkError";
import findComponentInTreeByField from "../../tree/findComponentInTreeByField";

export default (componentInstance = {}) => {
  try {
    const componentInTree = findComponentInTreeByField(window.joystick._internal.tree, componentInstance.id);
    return componentInTree?.children?.reduce((map = {}, childComponent) => {
      if (!map[childComponent?.instance?.id]) {
        map[childComponent?.instance?.id] = childComponent?.instance?.props;
      }

      return map;
    }, {});
  } catch (exception) {
    throwFrameworkError('component.render.getExistingPropsMap', exception);
  }
};
