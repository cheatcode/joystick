import throwFrameworkError from "../../../lib/throwFrameworkError";
import serialize from "./serialize";

const getListeners = (instance = {}, renderMethods = {}) => {
  try {
    let listenersToRegister = [
      ...(serialize(instance?.events)?.map((event = {}) => {
        return {
          ...event,
          instance,
          elements: document.querySelectorAll(`body [js-i="${instance.instanceId}"] ${event?.selector}`),
          handler: function eventHandler(DOMEvent) {
            Object.defineProperty(DOMEvent, "target", {
              value: DOMEvent.composedPath()[0],
            });

            event.handler(DOMEvent, {
              ...(instance || {}),
              setState: instance?.setState.bind(instance),
              ...(renderMethods || {}),
            });
          },
        }
      })),
    ];

    if (instance?.children) {
      const childInstances = Object.values(instance?.children || {})?.reduce((instances = [], componentInstances = []) => {
        return [...instances, ...componentInstances];
      }, []);

      const childInstanceEvents = childInstances.flatMap((childInstance) => {
        return getListeners(childInstance, renderMethods);
      });
  
      listenersToRegister = [...listenersToRegister, ...childInstanceEvents];
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
      const { instance, element, type, handler } = eventsToRegister[i];
      element.addEventListener(type, handler);

      instance._eventListeners = [
        ...(instance?._eventListeners || []),
        { instance, element, type, handler },
      ];
    }
  } catch (exception) {
    throwFrameworkError('component.events.registerListenersFix', exception);
  }
};

export default registerListenersFix;
