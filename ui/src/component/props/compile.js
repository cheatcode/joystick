import types from "../../lib/types.js";

const compile = (default_props_from_options = {}, props_from_options = {}) => {
  // NOTE: Combine props and defaultProps key names and filter to uniques only.
  const props = [...Object.keys(props_from_options), ...Object.keys(default_props_from_options)]
    .filter((value, index, self) => {
      return self.indexOf(value) === index;
    });

  return props.reduce((compiled_props, prop_name) => {
    const prop = props_from_options[prop_name];
    const prop_default = default_props_from_options[prop_name];
    const prop_has_value = !types.is_undefined(prop) && !types.is_null(prop);

    compiled_props[prop_name] = prop_has_value ? prop : prop_default;

    return compiled_props;
  }, {});
};

export default compile;
