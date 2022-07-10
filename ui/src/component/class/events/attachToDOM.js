import addToQueue from "../../../lib/addToQueue";
import throwFrameworkError from "../../../lib/throwFrameworkError";
import { isFunction } from "../../../lib/types";
import serializeEvents from "./serialize";
import addEventListener from "./addListener";

const attachEventListener = (selector = '', elements = [], event = {}, componentInstance = {}) => {
  try {
    for (let i = 0; i < elements.length; i += 1) {
      const element = elements[i];
      // NOTE: Pass this.id because we need a way to uniquely identify listeners
      // in joystick._internal.eventListeners.attached when removing listeners.
      addEventListener({
        componentId: componentInstance?.id,
        instanceId: componentInstance.instanceId,
        parentId: componentInstance?.parent?.instanceId,
        selector,
        element,
        eventType: event.type,
        eventListener: function listener(DOMEvent) {
          Object.defineProperty(DOMEvent, "target", {
            value: DOMEvent.composedPath()[0],
          });
          event.handler(DOMEvent, componentInstance);
        },
      });
    }
  } catch (exception) {
    throwFrameworkError('component.events.attachToDOM.attachEventListener', exception);
  }
};

const queueEventListeners = (events = [], componentInstance = {}) => {
  try {
    events.forEach((event) => {
      addToQueue('eventListeners', () => {
        const selector = `body [js-c="${componentInstance.id}"] ${event.selector}`;
        const elements = document.querySelectorAll(selector);
    
        if (elements && elements.length > 0) {
          attachEventListener(
            selector,
            elements,
            event,
            componentInstance
          );
        }
      });
    });
  } catch (exception) {
    throwFrameworkError('component.events.attachToDOM.queueEventListeners', exception);
  }
};

const attachOnBeforeUnmount = (componentInstance = {}) => {
  try {
    if (
      componentInstance.lifecycle &&
      componentInstance.lifecycle.onBeforeUnmount &&
      isFunction(componentInstance.lifecycle.onBeforeUnmount)
    ) {
      const onBeforeUnmount = function () {
        componentInstance.lifecycle.onBeforeUnmount(componentInstance);
      };

      window.removeEventListener("beforeunload", onBeforeUnmount);
      window.addEventListener("beforeunload", onBeforeUnmount);
    }
  } catch (exception) {
    throwFrameworkError('component.events.attachToDOM.attachOnBeforeUnmount', exception);
  }
};

export default (componentInstance = {}) => {
  try {
    const events = serializeEvents(componentInstance?.options?.events);
    attachOnBeforeUnmount(componentInstance);
    queueEventListeners(events, componentInstance);
  } catch (exception) {
    throwFrameworkError('component.events.attachToDOM');
  }
};