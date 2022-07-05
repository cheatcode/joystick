import { isDOM, isFunction, isObject } from "../lib/types";
import throwFrameworkError from "../lib/throwFrameworkError";
import initializeJoystickComponentTree from './initializeJoystickComponentTree';
import processQueue from "../lib/processQueue";
import appendToTarget from "./appendToTarget";


export default (Component = null, props = {}, target = null) => {
  try {
    if (!isFunction(Component)) {
      throwFrameworkError('mount', `Component to mount must be a function.`);
    }
  
    if (!isObject(props)) {
      throwFrameworkError('mount', `props must be an object.`);
    }
  
    if (!isDOM(target)) {
      throwFrameworkError('mount', `target must be a DOM node.`);
    }
  
    const component = Component({ props });
    initializeJoystickComponentTree(component);
    const componentAsDOM = component.render({ mounting: true });
  
    // NOTE: Run onBeforeMount for mounted component and all of its children.
    component.lifecycle.onBeforeMount();
    processQueue('lifecycle.onBeforeMount');

    appendToTarget(target, componentAsDOM);
  
    component.setDOMNodeOnInstance();
    component.appendCSSToHead(component);
    component.attachEventsToDOM(component);

    // NOTE: Run onMount for mounted component and all of its children.
    processQueue('eventListeners');
    component.lifecycle.onMount();
    processQueue('lifecycle.onMount');
  } catch (exception) {
    throwFrameworkError('mount', exception);
  }
}
