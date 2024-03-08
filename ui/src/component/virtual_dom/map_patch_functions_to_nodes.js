const map_patch_functions_to_nodes = (patch_functions = [], nodes = []) => {
  const map = [];
  const longest_list_length = Math.max(patch_functions.length, nodes.length);

  for (let i = 0; i < longest_list_length; i += 1) {
    const patch_function = patch_functions[i];
    const node = nodes[i];
    map.push([patch_function, node]);
  }

  return map;
};

export default map_patch_functions_to_nodes;
