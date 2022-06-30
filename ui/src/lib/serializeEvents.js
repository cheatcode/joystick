export default (events = {}) => {
  return Object.entries(events).map(([eventSelector, eventHandler]) => {
    const [type, ...selector] = eventSelector.split(" ");
    return {
      type: type.toLowerCase(),
      selector: selector.join(' '),
      handler: eventHandler,
    };
  });
};
