var getArgs_default = (args = {}) => {
  return Object.entries(args).reduce((values, [argName, argData]) => {
    if (argData && argData.value && argData.parent && argData.parent === "create") {
      values[argName] = argData.value;
    }
    if (argData && argData.value && (!argData.parent || argData.parent !== "create")) {
      values[argName] = !argData.value.includes("-") ? argData.value : null;
    }
    return values;
  }, {});
};
export {
  getArgs_default as default
};
