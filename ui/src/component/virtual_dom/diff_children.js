import diff_virtual_dom_nodes from './diff.js';
import map_patch_functions_to_nodes from './map_patch_functions_to_nodes.js';
import render_virtual_dom_to_dom from './render_virtual_dom_to_dom.js';

const append_new_children = (new_children_functions = [], parent_node) => {
  for (let i = 0; i < new_children_functions?.length; i += 1) {
    const patch_function = new_children_functions[i];

    if (patch_function && typeof patch_function === "function") {
      patch_function(parent_node);
    }
  }
};

const patch_child_nodes = (patch_node_map = []) => {
  for (let i = 0; i < patch_node_map?.length; i += 1) {
    const [patch_function, child_node] = patch_node_map[i];
    if (patch_function && typeof patch_function === "function") {
      patch_function(child_node);
    }
  }
};

const get_new_children_functions = (old_virtual_children = [], new_virtual_children = []) => {
  const new_children_functions = [];
  const new_children = new_virtual_children.slice(old_virtual_children.length);

  for (let i = 0; i < new_children?.length; i += 1) {
    const new_child = new_children[i];
    const new_child_function = (node) => {
      const new_dom_node = render_virtual_dom_to_dom(new_child);
      node.appendChild(new_dom_node);
      return node;
    };

    new_children_functions.push(new_child_function);
  }

  return new_children_functions;
};

const get_patches_for_existing_children = (old_virtual_children = [], new_virtual_children = []) => {
  const child_patch_functions = [];

  for (let i = 0; i < old_virtual_children?.length; i += 1) {
    const old_virtual_child = old_virtual_children[i];

    const child_patch_function = diff_virtual_dom_nodes(
      old_virtual_child,
      new_virtual_children[i],
    );
  
    child_patch_functions.push(child_patch_function);
  }

  return child_patch_functions;
};

const diff_children = (old_virtual_children = [], new_virtual_children = []) => {
  const child_patch_functions = get_patches_for_existing_children(old_virtual_children, new_virtual_children);
  const new_children_functions = get_new_children_functions(old_virtual_children, new_virtual_children);

  return (parent_node) => {
    if (parent_node) {
      const patch_node_map = map_patch_functions_to_nodes(child_patch_functions, parent_node.childNodes);
      patch_child_nodes(patch_node_map);
      append_new_children(new_children_functions, parent_node);
    }

    return parent_node;
  };
};

export default diff_children;
