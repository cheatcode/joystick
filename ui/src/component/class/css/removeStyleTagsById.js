import throwFrameworkError from "../../../lib/throwFrameworkError";

const getStyleTagSelector = (componentIds = []) => {
  try {
    let selector = '';

    for (let i = 0; i < componentIds?.length; i += 1) {
      const componentId = componentIds[i];
      selector += `${i !== 0 ? ', ' : ''}style[js-c="${componentId}"]`;
    }

    return selector;
  } catch (exception) {
    throwFrameworkError('component.css.removeStyleTagsById.getStyleTagSelector', exception);
  }
};

export default (componentIds = []) => {
  try {
    if (componentIds?.length > 0) {
      const selector = getStyleTagSelector(componentIds);
      const styleTags = document.head.querySelectorAll(selector);
      
      for (let i = 0; i < styleTags?.length; i += 1) {
        const styleTag = styleTags[i];
        document.head.removeChild(styleTag);
      }
    }
  } catch (exception) {
    throwFrameworkError('component.css.removeStyleTagsById', exception);
  }
};