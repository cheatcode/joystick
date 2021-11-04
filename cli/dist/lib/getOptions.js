var getOptions_default = (options = {}) => {
  return Object.entries(options).reduce((values, [optionName, optionData]) => {
    if (optionData && optionData.flags) {
      Object.entries(optionData.flags).forEach(([_flagName, flag]) => {
        if (flag && flag.value) {
          values[optionName] = flag.value && !`${flag.value}`.includes("-") ? flag.value : null;
        }
      });
    }
    return values;
  }, {});
};
export {
  getOptions_default as default
};
