import throwFrameworkError from "../../../lib/throwFrameworkError";

export default (listeners = []) => {
  try {
    for (const listener of listeners) {
      if (listener.element && listener.eventType && listener.eventListener) {
        listener.element.removeEventListener(
          listener.eventType,
          listener.eventListener
        );
        
        listener.element._joystick_event_selectors_ = listener.element._joystick_event_selectors_?.filter((selector) => {
          return selector !== listener.selector;
        });
      }
    }
  } catch (exception) {
    throwFrameworkError('component.events.removeListeners', exception);
  }
};
