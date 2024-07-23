import debounce from '../lib/debounce.js';

const add_node_to_tree = (node = {}, ssr_tree = null) => {
  const tree_on_window = typeof window !== 'undefined' ? window.joystick._internal.tree : [];
  (ssr_tree || tree_on_window).push(node);
  debounce(() => {
    console.log('DONE RENDERING!');
  }, 50);
};

export default add_node_to_tree;
