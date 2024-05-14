import diff_attributes from './diff_attributes.js';
import diff_children from './diff_children.js';
import element_patch_functions from './element_patch_functions.js';
import render_virtual_dom_to_dom from './render_virtual_dom_to_dom.js';

const get_replace_node_patch = (new_virtual_node) => {
  return (node) => {
    const new_dom_node = new_virtual_node ? render_virtual_dom_to_dom(new_virtual_node) : null;

    if (node && new_dom_node) {
      node.replaceWith(new_dom_node);
    }

    return new_dom_node;
  };
};

const get_remove_node_patch = () => {
  return (node) => {
    if (node) {
      node.remove();
    }
    
    return undefined;
  };
};

const diff = (old_virtual_node = undefined, new_virtual_node = undefined) => {
  if (old_virtual_node === undefined || new_virtual_node === undefined) {    
    return get_remove_node_patch();
  }

  const is_patching_string = typeof old_virtual_node === 'string' || typeof new_virtual_node === "string";

  if (is_patching_string) {
    return get_replace_node_patch(new_virtual_node, old_virtual_node);
  }

  const node_tag_name_changed = old_virtual_node.tag_name !== new_virtual_node.tag_name;

  if (node_tag_name_changed) {
    return get_replace_node_patch(new_virtual_node);
  }

  if (new_virtual_node.tag_name === 'select') {
    return element_patch_functions.select(old_virtual_node, new_virtual_node);
  }

  if (['pre', 'code'].includes(new_virtual_node.tag_name)) {
    return get_replace_node_patch(new_virtual_node, old_virtual_node);
  }

  return (node) => {
    diff_attributes(old_virtual_node.attributes, new_virtual_node.attributes)(node);
    
    if (old_virtual_node?.attributes?.class?.includes('tasks') || new_virtual_node?.attributes?.class?.includes('tasks')) {
      console.log({
        old_virtual_node,
        new_virtual_node,
      });
    }

    diff_children(old_virtual_node.children, new_virtual_node.children)(node);

    return node;
  };
};

export default diff;
