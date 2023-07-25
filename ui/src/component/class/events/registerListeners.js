import throwFrameworkError from "../../../lib/throwFrameworkError";
import serialize from "./serialize";

const getListeners = (instance = {}, renderMethods = {}, listenersToRegister = []) => {
  try {
    const eventsFromInstance = Object.keys(instance?.events || {})?.length > 0 ? serialize(instance?.events) : [];

    for (let i = 0; i < eventsFromInstance?.length; i += 1) {
      const eventFromInstance = eventsFromInstance[i];

      listenersToRegister.push({
        ...eventFromInstance,
        instance,
        elements: document.querySelectorAll(`body [js-i="${instance.instanceId}"] ${eventFromInstance?.selector}`),
        handler: function eventHandler(DOMEvent) {
          console.log('TARGET?', DOMEvent?.target);

//          Object.defineProperty(DOMEvent, "target", {
//            value: DOMEvent.composedPath()[0],
//          });

          eventFromInstance.handler(DOMEvent, {
            ...(instance || {}),
            setState: instance?.setState.bind(instance),
            ...(renderMethods || {}),
          });
        },
      });
    }

    if (instance?.children) {
      const childInstances = Object.entries(instance?.children)?.flatMap(([_componentId, instancesForComponentId]) => {
        return instancesForComponentId;
      });

      for (let c = 0; c < childInstances?.length; c += 1) {
        const childInstance = childInstances[c];
        getListeners(childInstance, renderMethods, listenersToRegister);
      }
    }

    return listenersToRegister;
  } catch (exception) {
    throwFrameworkError('component.events.registerListenersFix.getListeners', exception);
  }
};

const registerListenersFix = (rootInstance = {}, renderMethods = {}) => {
  try {
    const listenersToRegister = getListeners(rootInstance, renderMethods, []);
    const eventsToRegister = listenersToRegister?.flatMap((listener = {}) => {
      return [].flatMap.call(listener?.elements || [], (element) => {
        const { elements = [], ...listenerDefinition } = listener || {};
        return {
          ...listenerDefinition,
          element,
        }
      });
    });

    for (let i = 0; i < eventsToRegister?.length; i += 1) {
      const { instance, element, elementSelector, type, handler } = eventsToRegister[i];
      element.addEventListener(type, handler);

      instance._eventListeners = [
        ...(instance?._eventListeners || []),
        { instance, element, elementSelector, type, handler },
      ];
    }
  } catch (exception) {
    throwFrameworkError('component.events.registerListenersFix', exception);
  }
};

export default registerListenersFix;
