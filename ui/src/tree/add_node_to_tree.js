const add_node_to_tree = (node = {}, ssr_tree = null) => {
  const tree_on_window = typeof window !== 'undefined' ? window.joystick._internal.tree : [];

  (ssr_tree || tree_on_window).push(node);

  console.log(JSON.stringify({
    ssr_tree: !!ssr_tree,
    has_tree: typeof window !== 'undefined' && !!window.joystick._internal.tree,
    node_id: node?.id,
    node_css: node?.css,
    can_find_in_tree: typeof window !== 'undefined' && window.joystick._internal.tree?.some((node_in_tree) => {
      return node_in_tree.id === node.id;
    }),
  }));
};

export default add_node_to_tree;
