import throwFrameworkError from "../utils/throwFrameworkError";
import generateId from "../../../lib/generateId";
import { isDOM, isFunction } from "../../../lib/types";

export default ({
  componentId = '',
  parentId = '',
  element = null,
  eventType = null,
  eventListener = null,
}) => {
  try {
    if (element && isDOM(element) && eventType && eventListener && isFunction(eventListener)) {
      element.addEventListener(eventType, eventListener);
  
      window.joystick._internal.eventListeners.push({
        eventId: generateId(8),
        componentId,
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
