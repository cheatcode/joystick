import throwFrameworkError from "../../../lib/throwFrameworkError";
import { isString } from "../../../lib/types";

const parseAttributeMap = (attributeMap = {}) => {
  try {
    return Object.values(attributeMap)
      .reduce((attributes = {}, attribute) => {
        attributes[attribute.name] = attribute.value;
        return attributes;
      }, {});
  } catch (exception) {
    throwFrameworkError('component.virtualDOM.build.parseAttributeMap', exception);
  }
};

const buildVirtualDOMTree = (element = '') => {
  try {
    const tagName = (element.tagName && element.tagName.toLowerCase()) || "text";
  
    let virtualDOMNode = {
      tagName,
      attributes: parseAttributeMap(element.attributes),
      children: [].map.call(element.childNodes, (child) => {
        return buildVirtualDOMTree(child);
      }),
    };

    if (tagName === "text") {
      virtualDOMNode = element.textContent;
    }

    return virtualDOMNode;
  } catch (exception) {
    throwFrameworkError('component.virtualDOM.build.buildVirtualDOMTree', exception);
  }
};

const buildVirtualDOM = (html = '', componentId = '') => {
  try {
    if (!html || !isString(html)) {
      return null;
    }

    const dom = document.createElement("div");
    dom.setAttribute("js-c", componentId);
    dom.innerHTML = html;
    return dom;
  } catch (exception) {
    throwFrameworkError('component.virtualDOM.build.buildVirtualDOM', exception);
  }
};

export default (html = '', componentId = '') => {
  try {
    const virtualDOM = buildVirtualDOM(html, componentId);
    return buildVirtualDOMTree(virtualDOM);
  } catch (exception) {
    throwFrameworkError('component.virtualDOM.build', exception);
  }
};
