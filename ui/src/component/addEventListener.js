import throwFrameworkError from "../utils/throwFrameworkError";
import generateId from "../lib/generateId";

export default ({
  joystickInstance,
  id,
  parentId,
  element,
  eventType,
  eventListener,
}) => {
  if (!element) {
    throwFrameworkError("Must pass an element to addEventListener.");
  }

  if (!eventType) {
    throwFrameworkError("Must pass an eventType to addEventListener.");
  }

  if (!eventListener) {
    throwFrameworkError("Must pass an eventListener to addEventListener.");
  }

  element.addEventListener(eventType, eventListener);

  joystickInstance._internal.eventListeners.attached.push({
    id,
    eventId: generateId(8),
    parentId,
    element,
    eventType,
    eventListener,
  });
};
