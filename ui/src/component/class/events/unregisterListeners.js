import throwFrameworkError from "../../../lib/throwFrameworkError"

const getListeners = (instance = {}) => {
  try {
    let listenersToUnregister = (instance?._eventListeners || []);

    if (instance?.children) {
      const childInstances = Object.values(instance?.children || {})?.reduce((instances = [], componentInstances = []) => {
        return [...instances, ...componentInstances];
      }, []);

      const childInstanceListeners = childInstances.flatMap((childInstance = {}) => {
        return getListeners(childInstance);
      });
  
      listenersToUnregister = [...listenersToUnregister, ...childInstanceListeners];
    }

    return listenersToUnregister;
  } catch (exception) {
    throwFrameworkError('component.events.unregisterListenersFix.getListeners', exception);
  }
};

const unregisterListenersFix = (rootInstance = {}) => {
  try {
    const listenersToUnregister = getListeners(rootInstance);

    for (let i = 0; i < listenersToUnregister?.length; i += 1) {
      const { instance, element, type, handler } = listenersToUnregister[i];
      element.removeEventListener(type, handler);
      instance._eventListeners = instance._eventListeners?.splice(i, 1);
    }
  } catch (exception) {
    throwFrameworkError('component.events.unregisterListenersFix', exception);
  }
}

export default unregisterListenersFix;
