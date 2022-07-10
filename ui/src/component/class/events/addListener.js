import throwFrameworkError from "../../../lib/throwFrameworkError";
import generateId from "../../../lib/generateId";
import { isDOM, isFunction } from "../../../lib/types";

export default ({
  componentId = '',
  instanceId = '',
  parentId = '',
  selector = '',
  element = null,
  eventType = null,
  eventListener = null,
}) => {
  try {
    if (element && isDOM(element) && eventType && eventListener && isFunction(eventListener)) {
      element.addEventListener(eventType, eventListener);

      window.joystick._internal.eventListeners.push({
        eventId: generateId(8),
        selector,
        componentId,
        instanceId,
        parentId,
        element,
        eventType,
        eventListener,
      });
    }
  } catch (exception) {
    throwFrameworkError('component.events.addListener', exception);
  }
};
