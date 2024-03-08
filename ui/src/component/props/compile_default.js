import types from "../../lib/types";

const compile = (component_instance = {}, default_props = {}) => {
  const compiled_default_props = default_props(component_instance);

  if (compiled_default_props && types.is_object(compiled_default_props) && !types.is_array(compiled_default_props)) {
    return Object.assign({}, compiled_default_props);
  }

  return {};
};

const compile_default = (component_instance = {}, default_props = {}) => {
  if (types.is_function(default_props)) {
    return compile(component_instance, default_props);
  }

  return Object.assign({}, default_props);
};

export default compile_default;
