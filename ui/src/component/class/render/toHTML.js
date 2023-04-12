import throwFrameworkError from "../../../lib/throwFrameworkError";
import windowIsUndefined from "../../../lib/windowIsUndefined";
import findComponentDataFromSSR from "../data/findComponentDataFromSSR";
import compileRenderMethods from "../renderMethods/compile";
import getExistingPropsMap from "./getExistingPropsMap";
import getExistingStateMap from "./getExistingStateMap";
import sanitizeHTML from "./sanitizeHTML";
import wrapHTML from "./wrapHTML";

export default (componentInstance = {}, options = {}) => {
  try {
    if (options?.dataFromSSR) {
      componentInstance.data = findComponentDataFromSSR(options.dataFromSSR, componentInstance.id) || {};
    }

    const renderMethods = compileRenderMethods({
      ...componentInstance,
      getExistingPropsMap: {},
      existingPropsMap: !windowIsUndefined() ? getExistingPropsMap(componentInstance) : {},
      existingStateMap: !windowIsUndefined() ? getExistingStateMap(componentInstance) : {},
      ssrTree: options?.ssrTree,
      translations: options?.translations || componentInstance.translations || {},
      walkingTreeForSSR: options?.walkingTreeForSSR,
      renderingHTMLWithDataForSSR: options?.renderingHTMLWithDataForSSR,
      dataFromSSR: options?.dataFromSSR,
    });

    const html = componentInstance.options.render({
      ...(componentInstance || {}),
      setState: componentInstance.setState.bind(componentInstance),
      ...(renderMethods || {}),
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