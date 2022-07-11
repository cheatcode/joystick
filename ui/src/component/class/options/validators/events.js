import throwFrameworkError from "../../../../lib/throwFrameworkError";
import { isFunction, isObject } from "../../../../lib/types";
import allowedDOMEvents from "../allowedDOMEvents";

export default (value = null) => {
  try {
    if (!isObject(value)) {
      throwFrameworkError('component.optionValidators.events', "options.events must be an object.");
    }

    for (const eventKey of Object.keys(value)) {
      const [eventType] = eventKey.split(" ");
      if (!allowedDOMEvents.includes(eventType)) {
        throwFrameworkError(
          'component.optionValidators.events',
          `${eventType} is not a supported JavaScript event type.`
        );
      }
    }

    for (const [eventKey, eventValue] of Object.entries(value)) {
      if (!isFunction(eventValue)) {
        throwFrameworkError(
          'component.optionValidators.events',
          `options.events.${eventKey} must be assigned a function.`
        );
      }
    }
  } catch (exception) {
    throwFrameworkError('component.optionValidators.events', exception);
  }
}