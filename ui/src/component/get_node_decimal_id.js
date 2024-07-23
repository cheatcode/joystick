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

  const parent_decimal_id_parts = parent.decimal_id.split('.');
    
  if (parent_decimal_id_parts.length === 1) {
    // Adding first child to a top-level node
    return `${parent.decimal_id}.1`;
  } else {
    // Incrementing the last part for siblings
    const last_part = parseInt(parent_decimal_id_parts.pop(), 10);
    return [...parent_decimal_id_parts, last_part + 1].join('.');
  }
};

export default get_node_decimal_id;