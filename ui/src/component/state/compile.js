import types from '../../lib/types.js';

const run_state_function = (component_instance = {}, state = null) => {
  const compiled_state = state(component_instance);

  if (compiled_state && types.is_object(compiled_state) && !types.is_array(compiled_state)) {
    return Object.assign({}, compiled_state);
  }

  return {};
};

const compile_state = (component_instance = {}, state = {}) => {
  if (types.is_function(state)) {
    return run_state_function(component_instance, state);
  }

  return Object.assign({}, state);
};

export default compile_state;
