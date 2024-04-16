const add_node_to_tree = (node = {}, ssr_tree = null) => {
  const tree_on_window = typeof window !== 'undefined' ? window.joystick._internal.tree : [];

  console.log(JSON.stringify({
    has_tree: typeof window !== 'undefined' && !!window.joystick._internal.tree,
    node_id: node?.id,
    node_css: node?.css,
  }));

  (ssr_tree || tree_on_window).push(node);
};

export default add_node_to_tree;
