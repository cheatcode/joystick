const parseAttributeMap = (attributeMap = {}) => {
  return Object.entries(attributeMap).reduce(
    (attributes = {}, [index, attribute]) => {
      attributes[attribute.name] = attribute.value;
      return attributes;
    },
    {}
  );
};

const buildVDOMTree = (element = null) => {
  if (element) {
    const tagName = (element.tagName && element.tagName.toLowerCase()) || "text";

    let vnode = {
      tagName,
      attributes: parseAttributeMap(element.attributes),
      children: [].map.call(element.childNodes, (child) => {
        return buildVDOMTree(child);
      }),
    };

    if (tagName === "text") {
      vnode = element.textContent;
    }

    return vnode;
  }
};

export default buildVDOMTree;
