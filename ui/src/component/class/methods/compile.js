import throwFrameworkError from "../../../lib/throwFrameworkError";
import windowIsUndefined from "../../../lib/windowIsUndefined";
import getExistingPropsMap from "../render/getExistingPropsMap";
import getExistingStateMap from "../render/getExistingStateMap";
import compileRenderMethods from "../renderMethods/compile";

export default (componentInstance = {}, methods = {}) => {
  try {
    const renderMethods = compileRenderMethods({
      ...componentInstance,
      getExistingPropsMap: {},
      existingPropsMap: !windowIsUndefined() ? getExistingPropsMap(componentInstance) : {},
      existingStateMap: !windowIsUndefined() ? getExistingStateMap(componentInstance) : {},
      ssrTree: componentInstance?.parent?.ssrTree,
      translations: componentInstance?.parent?.translations || componentInstance.translations || {},
      walkingTreeForSSR: componentInstance?.parent?.walkingTreeForSSR,
      renderingHTMLWithDataForSSR: componentInstance?.parent?.renderingHTMLWithDataForSSR,
      dataFromSSR: componentInstance?.parent?.dataFromSSR || [],
    });

    return Object.entries(methods).reduce(
      (methods = {}, [methodName, methodFunction]) => {
        methods[methodName] = (...args) => {
          return methodFunction(...args, {
            ...componentInstance,
            setState: componentInstance.setState.bind(componentInstance),
            ...(renderMethods || {}),
          });
        };
        return methods;
      },
      {}
    );
  } catch (exception) {
    throwFrameworkError('component.methods.compile');
  }
};
