const parse_options = (options = {}) => {
  return Object.entries(options).reduce((values, [option_name, option_definition]) => {
    if (option_definition && option_definition.flags) {
      const flags = Object.values(option_definition.flags);
      for (let i = 0; i < flags?.length; i += 1) {
        const flag = flags[i];
        if (flag && flag.value) {
          values[option_name] = flag.value && ![`${flag.value}`.substring(0, 1)].includes('-')? flag.value : null;
        }
      }
    }
    return values;
  }, {});
};

export default parse_options;
