const renderElement = ({ tagName, attributes, children }) => {
  const element = document.createElement(tagName);

  for (const [k, v] of Object.entries(attributes)) {
    element.setAttribute(k, v);
  }

  for (const child of children) {
    const childDOM = render(child);
    element.appendChild(childDOM);
  }

  return element;
};

const render = (virtualNode) => {
  if (typeof virtualNode === "string") {
    return document.createTextNode(virtualNode);
  }

  return renderElement(virtualNode);
};

export default render;
