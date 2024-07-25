const build_existing_props_map = (root_instance_id = {}, base_props_map = {}) => {
  let props_map = { ...base_props_map };

  if (typeof window !== 'undefined') {
    const root_node = window?.joystick?._internal?.tree?.find((node) => node?.instance_id === root_instance_id);

    if (root_node) {
      if (props_map[root_node?.id]) {
        props_map[root_node?.id] = [
          ...(props_map[root_node?.id] || []),
          root_node?.props,
        ];
      } else {
        props_map[root_node?.id] = [root_node?.props];
      }
  
      const child_instance_ids = Object.values(root_node?.children || {})?.flatMap((child_instance_id) => child_instance_id);
  
      for (let i = 0; i < child_instance_ids?.length; i += 1) {
        const child_instance_id = child_instance_ids[i];
        props_map = build_existing_props_map(child_instance_id, props_map);
      }
    }

    return props_map;
  }

  return {};
};

export default build_existing_props_map;