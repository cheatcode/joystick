export default (node, target) => {
  if (target) {
    target.innerHTML = "";
    target.appendChild(node);

    return node;
  }

  return null;
};
