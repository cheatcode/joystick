const add_node_to_tree = (node = {}, ssr_tree = null) => {
  const tree_on_window = typeof window !== 'undefined' ? window.joystick._internal.tree : [];
  console.log(node);
  (ssr_tree || tree_on_window).push(node);
};

export default add_node_to_tree;
