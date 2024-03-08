const parse_args = (args = {}) => {
  return Object.entries(args).reduce((values, [arg_name, arg_definition]) => {
  	// NOTE: Handle hyphenated value for app name in joystick crate <name>.
    if (arg_definition && arg_definition.value && arg_definition.parent && arg_definition.parent === 'create') {
      values[arg_name] = arg_definition.value;
    }

    if (arg_definition && arg_definition.value && (!arg_definition.parent || arg_definition.parent !== 'create')) {
      values[arg_name] = !arg_definition.value.includes('-') ? arg_definition.value : null;
    }

    return values;
  }, {});
};

export default parse_args;
