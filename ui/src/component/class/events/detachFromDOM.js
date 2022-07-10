import throwFrameworkError from "../../../lib/throwFrameworkError";
import findComponentInTree from "../../findComponentInTree";
import getChildIdsFromTree from "../../getChildIdsFromTree";
import removeEventListeners from "./removeListeners";

export default (componentInstance = {}) => {
  try {
    // const componentInTree = findComponentInTree(window.joystick._internal.tree, componentInstance.instanceId, 'instanceId');
    const childComponentIds = getChildIdsFromTree(componentInTree, [], 'id', componentInstance?.id);
    const componentInstanceIds = [componentInstance?.id, ...childComponentIds];
    const eventListenersToDetach = window.joystick._internal.eventListeners.filter((listener) => {
      return componentInstanceIds?.includes(listener.componentId);
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