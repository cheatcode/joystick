export default () => {
  const events = window.joystick._internal.eventListeners;

  console.log({
    eventsToUnregister: events,
  });
  
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
}