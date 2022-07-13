export default () => {
  // NOTE: Wrap with a 0 setTimeout to ensure this happens at end of call stack *after*
  // all elements are mounted to screen.
  setTimeout(() => {
    const events = window.joystick._internal.eventListeners;

    for (let eventDefinitionIndex = 0; eventDefinitionIndex < events?.length; eventDefinitionIndex += 1) {
      const eventDefinition = events[eventDefinitionIndex];
  
      for (let eventIndex = 0; eventIndex < eventDefinition?.events?.length; eventIndex += 1) {
        const event = eventDefinition.events[eventIndex];
  
        for (let elementIndex = 0; elementIndex < event?.elements?.length; elementIndex += 1) {
          const element = event.elements[elementIndex];
          element.removeEventListener(event.type, event.eventListener);
        }
      }
    }
  }, 0);
}