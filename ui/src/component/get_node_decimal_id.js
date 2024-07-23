const get_node_decimal_id = (parent = null) => {
  if (typeof window === 'undefined') {
    return '';
  }

  /*
    Track joystick._internal.state_map.

    As you render components w/o a parent, check the current count of keys with
    a length of 1 (meaning they're a single-digit, top-level component).

    As you render components w/ a parent, get the parents top-level key ID and
    use the algo below to decide the new child ID.
  */
 
  if (!parent) {
    const state_map = window?.joystick?._internal?.state_map;
    const top_level_keys = Object.keys(state_map)?.filter((key = '') => {
      return key?.length === 1;
    })?.length;

    return `${top_level_keys + 1}`;
  }

  const parent_decimal_id_parts = parent?.decimal_id?.split('.');
  const last_part = parent_decimal_id_parts[parent_decimal_id_parts.length - 1];
  const new_decimal =
    parent_decimal_id_parts?.length > 1 ?
      [...parent_decimal_id_parts, parseInt(last_part) + 1]?.join('.') :
      [...parent_decimal_id_parts, 1]?.join('.');
  
  return new_decimal;
};

export default get_node_decimal_id;