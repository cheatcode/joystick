import throwFrameworkError from "../lib/throwFrameworkError";

export default (element, eventType, eventListener) => {
  if (!element) {
    throwFrameworkError("Must pass an element to removeEventListener.");
  }

  if (!eventType) {
    throwFrameworkError("Must pass an eventType to removeEventListener.");
  }

  if (!eventListener) {
    throwFrameworkError("Must pass an eventListener to removeEventListener.");
  }

  element.removeEventListener(eventType, eventListener);
};
