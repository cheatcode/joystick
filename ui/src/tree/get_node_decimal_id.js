const get_node_decimal_id = (tree_length = 0, parent = null) => {
  if (parent && parent?.decimal_id) {
    const parent_decimal_id_parts = parent?.decimal_id?.split('.');
    const last_part = parent_decimal_id_parts[parent_decimal_id_parts.length - 1];
    const new_decimal =
      parent_decimal_id_parts?.length > 1 ?
        [...parent_decimal_id_parts, parseInt(last_part) + 1]?.join('.') :
        [...parent_decimal_id_parts, 1]?.join('.');
    
    return new_decimal;
  }

  return tree_length + 1;
};

export default get_node_decimal_id;