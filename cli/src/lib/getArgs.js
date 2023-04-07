export default (args = {}) => {
  return Object.entries(args).reduce((values, [argName, argData]) => {
    // NOTE: When creating, names can have hyphens.
    if (argData && argData.value && argData.parent && argData.parent === 'create') {
      values[argName] = argData.value;
    }

    if (argData && argData.value && (!argData.parent || argData.parent !== 'create')) {
      values[argName] = !argData.value.includes('-') ? argData.value : null;
    }

    return values;
  }, {});
};