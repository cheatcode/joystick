import types from "../lib/types.js";

const replace_child_in_vdom = (virtual_dom = {}, child_instance_id = '', updated_vdom_node = {}) => {
  for (let i = 0; i < virtual_dom?.children?.length; i += 1) {
    const child = virtual_dom?.children[i];

    if (types.is_object(child) && child.attributes && child.attributes['js-i'] && child.attributes['js-i'] === child_instance_id) {
      virtual_dom.children[i] = updated_vdom_node;
      break;
    }

    if (types.is_object(child)) {
      replace_child_in_vdom(child, child_instance_id, updated_vdom_node);
    }
  }
};

export default replace_child_in_vdom;
