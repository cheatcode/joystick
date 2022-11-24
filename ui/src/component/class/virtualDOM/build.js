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

const getChildNodesForVirtualDOMNode = (parentChildNodes = [], childNode = []) => {
  try {

  } catch (exception) {
    throw new Error(`[actionName.getChildNodesForVirtualDOMNode] ${exception.message}`);
  }
};

const flattenAndReplaceWhenElements = (dom = {}) => {
  try {
    if (dom?.childNodes?.length > 0) {
      [].forEach.call(dom.childNodes, (childNode) => {
        flattenAndReplaceWhenElements(childNode);

        if (childNode?.tagName === 'WHEN' && childNode.childNodes?.length === 0) {
          childNode.replaceWith(document.createTextNode(''));
        }

        if (childNode?.tagName === 'WHEN' && childNode?.childNodes?.length > 0) {
          childNode.replaceWith(...childNode.childNodes);
        }
      }); 
    }
    
    return dom;
  } catch (exception) {
    throw new Error(`[actionName.flattenAndReplaceWhenElements] ${exception.message}`);
  }
};

const buildVirtualDOM = (html = '', componentId = '') => {
  try {
    const dom = document.createElement("div");
    dom.setAttribute("js-c", componentId);
    dom.innerHTML = html;
    return flattenAndReplaceWhenElements(dom);
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
