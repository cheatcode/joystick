const get_node_decimal_id = (tree_length = 0, parent = null) => {
  if (parent && parent.decimal_id) {
    const parent_decimal_id_parts = parent.decimal_id.split('.');
    
    if (parent_decimal_id_parts.length === 1) {
      // Adding first child to a top-level node
      return `${parent.decimal_id}.1`;
    } else {
      // Incrementing the last part for siblings
      const last_part = parseInt(parent_decimal_id_parts.pop(), 10);
      return [...parent_decimal_id_parts, last_part + 1].join('.');
    }
  }

  console.log(tree_length);

  // No parent, return top-level ID
  return `${tree_length + 1}`;
};

export default get_node_decimal_id;