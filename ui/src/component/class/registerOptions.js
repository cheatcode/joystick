import generateId from "../../lib/generateId";
import findComponentDataFromSSR from './data/findComponentDataFromSSR';
import validateForm from '../../forms/validate';
import throwFrameworkError from "../../lib/throwFrameworkError";
import compileProps from "./props/compile";
import compileCSS from './css/compile';
import compileState from './state/compile';
import compileLifecycle from './lifecycle/compile';
import compileMethods from "./methods/compile";
import compileUrl from "./url/compile";
import windowIsUndefined from "../../lib/windowIsUndefined";

export default (componentInstance = {}, componentOptions = {}) => {
  try {
    componentInstance.options = componentOptions || {};
    componentInstance.id = componentOptions?._componentId || null;
    componentInstance.instanceId = generateId(8);
    componentInstance.ssrId = componentOptions?._ssrId || null;
    componentInstance.css = compileCSS();
    componentInstance.data = findComponentDataFromSSR(componentOptions?.dataFromSSR, componentOptions?._ssrId);
    componentInstance.defaultProps = componentOptions?.defaultProps || {};
    componentInstance.props = compileProps(componentOptions?.defaultProps, componentOptions?.existingProps || componentOptions?.props);
    componentInstance.state = compileState(componentInstance, componentOptions?.existingState || componentOptions?.state);
    componentInstance.events = componentOptions?.events || {};
    componentInstance.lifecycle = compileLifecycle(componentInstance, componentOptions?.lifecycle);
    componentInstance.methods = compileMethods(componentInstance, componentOptions?.methods);
    componentInstance.wrapper = componentOptions?.wrapper || {};

    componentInstance.translations = componentOptions?.translations || {};
    componentInstance.validateForm = validateForm;

    componentInstance.DOMNode = null; // NOTE: Set after component is mounted to DOM.
    componentInstance.dom = {};
    componentInstance.dom.virtual = {};
    componentInstance.dom.actual = {};

    if (windowIsUndefined()) {
      componentInstance.url = compileUrl(componentOptions?.url);
    }

    if (!windowIsUndefined() && window.__joystick_url__) {
      componentInstance.url = compileUrl(window.__joystick_url__);
    }
  } catch (exception) {
    throwFrameworkError('component.registerOptions', exception);
  };
}