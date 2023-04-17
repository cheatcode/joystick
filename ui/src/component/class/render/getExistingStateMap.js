import throwFrameworkError from "../../../lib/throwFrameworkError";

const buildMapForChildren = (children = {}) => {
  try {
    return Object.entries(children)?.reduce((stateMap = {}, [componentId, childInstances] = {}) => {
      stateMap[componentId] = childInstances?.map((childInstance = {}) => {
        return {
          state: childInstance?.state,
          children: buildMapForChildren(childInstance?.children),
        };
      });
      return stateMap;
    }, {});
  } catch (exception) {
    throwFrameworkError('component.render.getExistingStateMap.buildMapForChildren', exception);
  }
};

export default (children = {}) => {
  try {
    return buildMapForChildren(children);
  } catch (exception) {
    throwFrameworkError('component.render.getExistingStateMap', exception);
  }
};
