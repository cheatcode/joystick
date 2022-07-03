import throwFrameworkError from "../../../lib/throwFrameworkError";
import compileRenderMethods from "../renderMethods/compile";
import getExistingPropsMap from "./getExistingPropsMap";
import getExistingStateMap from "./getExistingStateMap";
import sanitizeHTML from "./sanitizeHTML";
import wrapHTML from "./wrapHTML";

export default (componentInstance = {}, options = {}) => {
  try {
    const existingPropsMap = getExistingPropsMap(componentInstance);
    const existingStateMap = getExistingStateMap(componentInstance);
    const renderMethods = compileRenderMethods({
      existingPropsMap,
      existingStateMap,
      ssrTree: options?.ssrTree,
      translations: options?.translations || componentInstance.translations || {},
      walkingTreeForSSR: options?.walkingTreeForSSR,
      dataFromSSR: options?.dataFromSSR,
    });

    const html = componentInstance.options.render({
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