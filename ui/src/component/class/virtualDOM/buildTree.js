import throwFrameworkError from "../../../lib/throwFrameworkError";

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

const flattenWhenTags = (element = {}) => {
  try {
    if (element.tagName === 'WHEN') {
      return [].flatMap.call(element?.childNodes, (childNode) => {
        if (childNode?.tagName === 'WHEN') {
          return flattenWhenTags(childNode);
        }

        return buildVirtualDOMTree(childNode);
      });
    }

    return buildVirtualDOMTree(element);
  } catch (exception) {
    throwFrameworkError('component.virtualDOM.build.flattenWhenTags', exception);
  }
};

const buildVirtualDOMTree = (element = {}) => {
  try {
    const tagName = (element && element.tagName && element.tagName.toLowerCase()) || "text";

    let virtualDOMNode = {
      tagName,
      attributes: parseAttributeMap(element.attributes),
      children: [].flatMap.call(element.childNodes, (child) => {
        return flattenWhenTags(child);
      }),
    };

    if (tagName === "text") {
      virtualDOMNode = element.textContent;
    }

    return virtualDOMNode;
  } catch (exception) {
    throwFrameworkError('component.virtualDOM.build', exception);
  }
};

export default buildVirtualDOMTree;
