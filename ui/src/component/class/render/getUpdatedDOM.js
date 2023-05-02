import renderToHTML from './toHTML';
import buildVirtualDOM from '../virtualDOM/build';
import renderTreeToDOM from '../virtualDOM/renderTreeToDOM';
import throwFrameworkError from "../../../lib/throwFrameworkError";

export default (componentInstance = {}, options = {}) => {
  try {
    const html = renderToHTML(componentInstance, {
      existingChildren: options?.existingChildren,
    });
    const virtualDOMTree = buildVirtualDOM(html.wrapped);
    const DOMInMemory = options.includeActual && virtualDOMTree ? renderTreeToDOM(virtualDOMTree) : null;

    return {
      html,
      virtual: virtualDOMTree,
      actual: DOMInMemory,
    };
  } catch (exception) {
    throwFrameworkError('component.render.getUpdatedDOM', exception);
  }
};