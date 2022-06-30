import throwFrameworkError from "../../../lib/throwFrameworkError";
import defaultLifecycleMethods from "../defaultLifecycleMethods";

export default (componentInstance = {}, lifecycle = {}) => {
  try {
    if (!lifecycle) {
      return defaultLifecycleMethods;
    }

    return Object.entries(lifecycle)
      .reduce((compiledLifecycle = {}, [lifecycleMethodName, lifecycleMethodFunction]) => {
        compiledLifecycle[lifecycleMethodName] = () => {
          return lifecycleMethodFunction(componentInstance);
        };

        return compiledLifecycle;
      }, {});
  } catch (exception) {
    throwFrameworkError('component.lifecycle.compile', exception);
  }
};
