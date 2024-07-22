import get_node_decimal_id from './get_node_decimal_id.js';

const add_node_to_tree = (node = {}, ssr_tree = null) => {
  const tree_on_window = typeof window !== 'undefined' ? window.joystick._internal.tree : [];
  const tree = (ssr_tree || tree_on_window);

  node.decimal_id = get_node_decimal_id(tree?.length, node.parent);
  console.log('NODE DECIMAL ID', node.decimal_id);
  
  tree.push(node);

  // NOTE: Return this as we can reference it later to find the state value in the
  // component() render_method implementation.

  if (node.DOMNode) {
    node.DOMNode.setAttribute('data-decimal-id', node.decimal_id);
  }

  return node.decimal_id;
};

export default add_node_to_tree;
