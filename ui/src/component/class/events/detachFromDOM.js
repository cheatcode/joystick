import throwFrameworkError from "../../../lib/throwFrameworkError";
import getChildIdsFromTree from "../../getChildIdsFromTree";

export default (componentInTree = {}, componentInstance = {}) => {
  try {
    const childComponentIds = getChildIdsFromTree(componentInTree, [], componentInstance?.id);
    const componentIds = [componentInstance?.id, ...childComponentIds];
    const eventListenersToDetach = window.joystick._internal.eventListeners.attached.filter((listener) => {
      return componentIds?.includes(listener.componentId);
    });
    
    removeEventListeners(eventListenersToDetach);

    const eventIds = eventListenersToDetach.map(({ eventId }) => eventId);
    const eventListenersAfterRemoval = window.joystick._internal.eventListeners.filter(
      ({ eventId }) => {
        return !eventIds.includes(eventId);
      }
    );

    window.joystick._internal.eventListeners = eventListenersAfterRemoval;
  } catch (exception) {
    throwFrameworkError('component.events.detachFromDOM', exception);
  }
};