import serializeEvents from "./serialize";

const serializeEventsFromInstances = (tree = {}, events = []) => {
  const eventsToAttach = tree.instance.options.events || {};
  const hasEventsToAttach = Object.keys(eventsToAttach).length > 0;

  if (hasEventsToAttach) {
    events.push({
      id: tree.id,
      instanceId: tree.instance.instanceId,
      events: serializeEvents(eventsToAttach).map((eventToAttach) => {
        const elementsByInstanceId = document.querySelectorAll(`body [js-i="${tree.instance.instanceId}"] ${eventToAttach.selector}`);
        const elementsByComponentId = document.querySelectorAll(`body [js-c="${tree.id}"] ${eventToAttach.selector}`);
      
        return {
          ...eventToAttach,
          eventListener: function listener(DOMEvent) {
            Object.defineProperty(DOMEvent, "target", {
              value: DOMEvent.composedPath()[0],
            });
            eventToAttach.handler(DOMEvent, tree.instance);
          },
          elements: elementsByInstanceId?.length > 0 ? elementsByInstanceId : elementsByComponentId,
        };
      }),
      instance: tree.instance,
    });
  }

  if (tree?.children?.length > 0) {
    for (let i = 0; i < tree?.children?.length; i += 1) {
      const child = tree?.children[i];
      serializeEventsFromInstances(child, events);
    }
  }

  return events;
};

export default () => {
  const events = serializeEventsFromInstances(window.joystick._internal.tree, []);

  for (let eventDefinitionIndex = 0; eventDefinitionIndex < events?.length; eventDefinitionIndex += 1) {
    const eventDefinition = events[eventDefinitionIndex];

    for (let eventIndex = 0; eventIndex < eventDefinition?.events?.length; eventIndex += 1) {
      const event = eventDefinition.events[eventIndex];

      for (let elementIndex = 0; elementIndex < event?.elements?.length; elementIndex += 1) {
        const element = event.elements[elementIndex];
        element.addEventListener(event.type, event.eventListener);
      }
    }
  }

  window.joystick._internal.eventListeners = events;
};