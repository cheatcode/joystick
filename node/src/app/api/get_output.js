import types from "../../lib/types.js";

const filter_output = (object = {}, fields = []) => {
	const entries_for_object_to_filter = Object.entries(object || {});

	for (let i = 0; i < entries_for_object_to_filter?.length; i += 1) {
		const [key, value] = entries_for_object_to_filter[i];
    const key_in_fields = fields.find((field) => field.key === key);

    if (!key_in_fields) {
      delete object[key];
    }

    // if (key_in_fields && types.is_object(value) && key_in_fields.children.length === 0) {
    //   return value;
    // }

    if (key_in_fields && types.is_object(value) && key_in_fields.children.length === 0) {
      continue;
    }

    if (key_in_fields && types.is_object(value) && key_in_fields.children.length > 0) {
      filter_output(value, key_in_fields.children);
    }

    if (
      key_in_fields &&
      types.is_array(value) &&
      key_in_fields.children &&
      key_in_fields.children.length > 0
    ) {
      for (let i = 0; i < value?.length; i += 1) {
        const value_element = value[i];
        if (value_element && types.is_object(value_element)) {
          filter_output(value_element, key_in_fields.children);
        }
      }
    }
	}

  return object;
};

const get_path_part_arrays = (paths = []) => {
  return paths.map((path) => {
    return path.split(".");
  });
};

const get_head_tail = (path_part_array = []) => {
  const [head, ...tail] = path_part_array;
  return {
    head,
    tail,
  };
};

const get_head_tail_for_paths = (path_part_arrays = []) => {
  return path_part_arrays.map((path_part_array) => {
    return get_head_tail(path_part_array);
  });
};

const add_to_map = (map = [], head_tail_for_paths = []) => {
  for (let i = 0; i < head_tail_for_paths?.length; i += 1) {
    const head_tail_for_path = head_tail_for_paths[i];
    
    const existing_map_entry = map.find(
      (map_entry) => map_entry.key === head_tail_for_path.head
    );

    if (!existing_map_entry) {
      const head_tail_for_children =
        head_tail_for_path.tail && head_tail_for_path.tail.length > 0
          ? get_head_tail(head_tail_for_path.tail)
          : null;

      map.push({
        key: head_tail_for_path.head,
        children: head_tail_for_children
          ? add_to_map([], [head_tail_for_children])
          : [], // The NEXT thing to nest and the parent.
      });
    }

    if (existing_map_entry) {
      const head_tail_for_children =
        head_tail_for_path.tail && head_tail_for_path.tail.length > 0
          ? get_head_tail(head_tail_for_path.tail)
          : null;

      existing_map_entry.children = [
        ...(head_tail_for_children
          ? add_to_map(existing_map_entry.children, [head_tail_for_children])
          : []),
      ];
    }
  }

  return map;
};

const get_output = (output = {}, output_fields = []) => {
  const map = [];
  const path_part_arrays = get_path_part_arrays(output_fields);
  const head_tail_for_paths = get_head_tail_for_paths(path_part_arrays);

  add_to_map(map, head_tail_for_paths);

  if (types.is_array(output)) {
    return output.map((element) => {
      return filter_output(element, map);
    });
  }

  return filter_output(output, map);
};

export default get_output;

