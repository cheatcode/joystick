import get_node_decimal_id from './get_node_decimal_id.js';

const add_node_to_tree = (node = {}, ssr_tree = null) => {
  const tree_on_window = typeof window !== 'undefined' ? window.joystick._internal.tree : [];
  const tree = (ssr_tree || tree_on_window);

  if (typeof window !== 'undefined') {
    const nodes_without_parents_count = tree?.reduce((total = 0, node = {}) => {
      if (!node?.parent) {
        total += 1;
      }

      return total;
    }, 0);

    console.log({
      nodes_without_parents_count,
    })

    node.decimal_id = get_node_decimal_id(nodes_without_parents_count, node?.parent);
  }

  tree.push(node);

  // NOTE: Return this as we can reference it later to find the state value in the
  // component() render_method implementation.

  if (typeof window !== 'undefined' && node.DOMNode) {
    node.DOMNode.setAttribute('data-decimal-id', node.decimal_id);
  }

  return node.decimal_id;
};

export default add_node_to_tree;
