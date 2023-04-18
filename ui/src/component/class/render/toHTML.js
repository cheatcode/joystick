import throwFrameworkError from "../../../lib/throwFrameworkError";
import findComponentDataFromSSR from "../data/findComponentDataFromSSR";
import compileRenderMethods from "../renderMethods/compile";
import compileLifecycle from "../lifecycle/compile";
import compileMethods from "../methods/compile";
import getExistingStateMap from "./getExistingStateMap";
import sanitizeHTML from "./sanitizeHTML";
import wrapHTML from "./wrapHTML";
import clearTimersOnChildren from "./clearTimersOnChildren";

export default (componentInstance = {}, options = {}) => {
  try {
    if (options?.dataFromSSR) {
      componentInstance.data = findComponentDataFromSSR(options.dataFromSSR, componentInstance.id) || {};
    }
    
    // NOTE: Get the existing state map for child components and then dump the array.
    clearTimersOnChildren(componentInstance?.children);
    const existingStateMap = getExistingStateMap(options?.existingChildren || componentInstance?.children) || {};
    componentInstance.children = {};

    // NOTE: Set these on the component instance so we can hand them to registerEventListeners in render() function
    // of component/class/index.js.
    componentInstance.renderMethods = compileRenderMethods({
      ...componentInstance,
      existingStateMap,
      translations: options?.translations || componentInstance.translations || {},
      // NOTE: renderToHTML() is called directly via @joystick.js/node when rendering for SSR.
      // These values do not get passed on the client.
      ssrTree: options?.ssrTree,
      walkingTreeForSSR: options?.walkingTreeForSSR,
      renderingHTMLWithDataForSSR: options?.renderingHTMLWithDataForSSR,
      dataFromSSR: options?.dataFromSSR,
    });

    // NOTE: Before running a render, make sure to update the component instance and render
    // methods passed to lifecycle functions and methods to ensure they don't have stale data.
    // componentInstance.lifecycle = compileLifecycle(componentInstance, componentInstance.options.lifecycle);
    componentInstance.methods = compileMethods(componentInstance, componentInstance.options.methods);

    const html = componentInstance.options.render({
      ...(componentInstance || {}),
      setState: componentInstance.setState.bind(componentInstance),
      ...(componentInstance.renderMethods || {}),
    });

    const sanitizedHTML = sanitizeHTML(html);
    const wrappedHTML = wrapHTML(componentInstance, sanitizedHTML);

    return {
      unwrapped: sanitizedHTML,
      wrapped: wrappedHTML,
    };
  } catch (exception) {
    throwFrameworkError('component.render.toHTML', exception);
  }
};