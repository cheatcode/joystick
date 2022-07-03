import { isString } from "../../../lib/types";

const renderElement = (virtualDOMNode = {}) => {
  try {
    const element = document.createElement(virtualDOMNode.tagName);
    const attributes = Object.entries(virtualDOMNode.attributes);

    for (let i = 0; i < attributes.length; i += 1) {
      const [key, value] = attributes[i];
      element.setAttribute(key, value);
    }
  
    for (let i = 0; i < virtualDOMNode?.children?.length; i += 1) {
      const childVirtualDOMNode = virtualDOMNode?.children[i];
      const childDOMNode = renderTreeToDOM(childVirtualDOMNode);
      element.appendChild(childDOMNode);
    }

    return element;
  } catch (exception) {
    throwFrameworkError('component.virtualDOM.renderTreeToDOM.renderElement', exception);
  }
};

const renderTreeToDOM = (virtualDOMNode = null) => {
  try {
    // NOTE: buildVirtualDOM (./build) can potentially return a string if the node
    // being rendered is text.
    if (isString(virtualDOMNode)) {
      return document.createTextNode(virtualDOMNode);
    }
  
    return renderElement(virtualDOMNode);
  } catch (exception) {
    throwFrameworkError('component.virtualDOM.renderTreeToDOM', exception);
  }
};

export default renderTreeToDOM;
