import throwFrameworkError from "../../../lib/throwFrameworkError"

export default (events = {}) => {
  try {
    return Object.entries(events).map(([eventSelector, eventHandler]) => {
      const [type, ...selector] = eventSelector.split(" ");
      return {
        type: type.toLowerCase(),
        selector: selector.join(' '),
        handler: eventHandler,
      };
    });
  } catch (exception) {
    throwFrameworkError('component.events.serialize', exception);
  }
}