export default (listeners = []) => {
  for (const listener of listeners) {
    if (listener.element && listener.eventType && listener.eventListener) {
      listener.element.removeEventListener(
        listener.eventType,
        listener.eventListener
      );
    }
  }
};
