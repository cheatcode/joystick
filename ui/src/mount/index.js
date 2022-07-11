import { isDOM, isFunction, isObject } from "../lib/types";
import throwFrameworkError from "../lib/throwFrameworkError";
import initializeJoystickComponentTree from './initializeJoystickComponentTree';
import processQueue from "../lib/processQueue";
import appendToTarget from "./appendToTarget";
import registerEventListeners from "../component/class/events/registerListeners";


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
    component.appendCSSToHead();
    
    // NOTE: Run onMount for mounted component and all of its children.
    component.lifecycle.onMount();
    processQueue('lifecycle.onMount');
  
    // NOTE: Run event listener attachment last to make sure everything is mounted.
    registerEventListeners();
  } catch (exception) {
    throwFrameworkError('mount', exception);
  }
}
