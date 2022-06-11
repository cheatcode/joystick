const mapPatchFunctionsToNodes = (patchFunctions = [], nodes = []) => {
  const map = [];
  const longestListLength = Math.max(patchFunctions.length, nodes.length);

  for (let i = 0; i < longestListLength; i += 1) {
    const patchFunction = patchFunctions[i];
    const node = nodes[i];
    map.push([patchFunction, node]);
  }

  return map;
};

export default mapPatchFunctionsToNodes;
