import throwFrameworkError from "../../../lib/throwFrameworkError";
import windowIsUndefined from "../../../lib/windowIsUndefined";
import defaultLifecycleMethods from "../options/defaultLifecycleMethods";
import getExistingPropsMap from "../render/getExistingPropsMap";
import getExistingStateMap from "../render/getExistingStateMap";
import compileRenderMethods from "../renderMethods/compile";

export default (componentInstance = {}, lifecycle = {}) => {
  try {
    if (!lifecycle) {
      return defaultLifecycleMethods;
    }

    const renderMethods = compileRenderMethods({
      ...componentInstance,
      getExistingPropsMap: {},
      existingPropsMap: !windowIsUndefined() ? getExistingPropsMap(componentInstance) : {},
      existingStateMap: !windowIsUndefined() ? getExistingStateMap(componentInstance) : {},
      ssrTree: componentInstance?.parent?.ssrTree,
      translations: componentInstance?.parent?.translations || componentInstance.translations || {},
      walkingTreeForSSR: componentInstance?.parent?.walkingTreeForSSR,
      renderingHTMLWithDataForSSR: componentInstance?.parent?.renderingHTMLWithDataForSSR,
      dataFromSSR: componentInstance?.parent?.dataFromSSR,
    });

    return Object.entries({
      ...defaultLifecycleMethods,
      ...(lifecycle || {}),
    })
      .reduce((compiledLifecycle = {}, [lifecycleMethodName, lifecycleMethodFunction]) => {
        compiledLifecycle[lifecycleMethodName] = () => {
          return lifecycleMethodFunction({
            ...componentInstance,
            setState: componentInstance.setState.bind(componentInstance),
            ...(renderMethods || {}),
          });
        };

        return compiledLifecycle;
      }, {});
  } catch (exception) {
    throwFrameworkError('component.lifecycle.compile', exception);
  }
};
