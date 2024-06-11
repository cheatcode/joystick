const unique_array = (input_array = []) => {
  const unique_primitives_set = new Set();
  const unique_references_map = new WeakMap();
  const unique_result_array = [];

  for (let i = 0; i < input_array.length; i++) {
    const item = input_array[i];
    if (typeof item === 'object' && item !== null) {
      if (!unique_references_map.has(item)) {
        unique_references_map.set(item, true);
        unique_result_array.push(item);
      }
    } else {
      if (!unique_primitives_set.has(item)) {
        unique_primitives_set.add(item);
        unique_result_array.push(item);
      }
    }
  }

  return unique_result_array;
};

export default unique_array;
