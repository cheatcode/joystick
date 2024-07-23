const build_existing_state_map = (root_instance_id = {}, base_state_map = {}) => {
  let state_map = { ...base_state_map };

  if (typeof window !== 'undefined') {
    const root_node = window?.joystick?._internal?.tree?.find((node) => node?.instance_id === root_instance_id);
    
    if (state_map[root_node?.id]) {
      state_map[root_node?.id] = [
        ...(state_map[root_node?.id] || []),
        root_node?.state,
      ];
    } else {
      state_map[root_node?.id] = [root_node?.state];
    }

    const child_instance_ids = Object.values(root_node?.children || {})?.flatMap((child_instance_id) => child_instance_id);

    for (let i = 0; i < child_instance_ids?.length; i += 1) {
      const child_instance_id = child_instance_ids[i];
      state_map = build_existing_state_map(child_instance_id, state_map);
    }

    return state_map;
  }

  return {};
};

export default build_existing_state_map;