import throwFrameworkError from "../../../lib/throwFrameworkError";
import renderToHTML from './toHTML';
import buildVirtualDOM from '../virtualDOM/build';

export default (componentInstance = {}, options = {}) => {
  try {
    const html = renderToHTML(componentInstance);
    const virtualDOMTree = buildVirtualDOM(html.unwrapped, componentInstance.id);
    const virtualDOM = options.includeActual ? renderTreeToDOM(virtualDOMTree) : null;

    return {
      html,
      virtual: virtualDOMTree,
      actual: virtualDOM,
    };
  } catch (exception) {
    throwFrameworkError('component.render.getUpdatedDOM', exception);
  }
};