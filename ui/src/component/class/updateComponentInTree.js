const updateComponentInTree = (id, tree, property, value) => {
  if (tree.id == id) {
    tree[property] = value;
  }

  if (tree.children !== undefined && tree.children.length > 0) {
    for (let i = 0; i < tree.children.length; i++) {
      tree.children[i] = updateComponentInTree(id, tree.children[i], property, value);
    }
  }

  return tree;
}

export default updateComponentInTree;