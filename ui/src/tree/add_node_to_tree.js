import get_node_decimal_id from './get_node_decimal_id.js';

const add_node_to_tree = (node = {}, ssr_tree = null) => {
  const tree_on_window = typeof window !== 'undefined' ? window.joystick._internal.tree : [];
  const tree = (ssr_tree || tree_on_window);
  node.decimal_id = get_node_decimal_id(tree?.length, node.parent);
  tree.push(node);
};

export default add_node_to_tree;
