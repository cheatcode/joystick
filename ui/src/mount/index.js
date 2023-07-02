import { isDOM, isFunction, isObject } from "../lib/types";
import throwFrameworkError from "../lib/throwFrameworkError";
import initializeJoystickComponentTree from "./initializeJoystickComponentTree";
import processQueue from "../lib/processQueue";
import appendToTarget from "./appendToTarget";
import registerListeners from "../component/class/events/registerListeners";

export default (Component = null, props = {}, target = null) => {
  try {
    if (!isFunction(Component)) {
      throwFrameworkError("mount", `Component to mount must be a function.`);
    }

    if (!isObject(props)) {
      throwFrameworkError("mount", `props must be an object.`);
    }

    if (!isDOM(target)) {
      throwFrameworkError("mount", `target must be a DOM node.`);
    }

    const component = Component({ props });
    initializeJoystickComponentTree(component);
    const componentAsDOM = component.render({
      mounting: true,
      existingChildren: window.__joystick_childrenBeforeHMRUpdate__ || null,
    });

    if (componentAsDOM) {
      componentAsDOM.setAttribute("js-ssrId", component.ssrId);
      componentAsDOM.setAttribute("js-c", component.id);
      componentAsDOM.setAttribute("js-i", component.instanceId);
    }

    // NOTE: Run onBeforeMount for mounted component and all of its children.
    component.lifecycle.onBeforeMount();
    processQueue("lifecycle.onBeforeMount");

    appendToTarget(target, componentAsDOM);

    component.setDOMNodeOnInstance();
    window.joystick._internal.css.update();

    // NOTE: Run event listener attachment before lifecycle methods in case onMount
    // triggers a re-render (potential for duplicate event listeners if we do this last).
    registerListeners(component, component.renderMethods);

    // NOTE: Run onMount for mounted component and all of its children.
    component.lifecycle.onMount();
    processQueue("lifecycle.onMount");
  } catch (exception) {
    throwFrameworkError("mount", exception);
  }
};
