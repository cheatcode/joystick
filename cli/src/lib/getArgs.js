export default (args = {}) => {
  return Object.entries(args).reduce((values, [argName, argData]) => {
    if (argData && argData.value) {
      values[argName] = argData.value && !argData.value.includes('-') ? argData.value : null;
    }

    return values;
  }, {});
};