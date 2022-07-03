import throwFrameworkError from "../../../lib/throwFrameworkError";

export default (componentInstance = {}) => {
  try {
    return componentInstance?.componentInTree?.children?.reduce((map = {}, childComponent) => {
      if (!map[childComponent?.instance?.ssrId]) {
        map[childComponent?.instance?.ssrId] = childComponent?.instance?.state;
      }

      return map;
    }, {});
  } catch (exception) {
    throwFrameworkError('component.render.getExistingStateMap', exception);
  }
};
