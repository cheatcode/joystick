import generate_id from "../../lib/generate_id.js";
import track_function_call from "../../test/track_function_call.js";

const compile = (component_instance = {}, methods = {}) => {
  return Object.entries(methods).reduce(
    (methods = {}, [method_name, method_function]) => {
      methods[method_name] = (...args) => {
        track_function_call(`ui.${component_instance?.options?.test?.name || generate_id()}.methods.${method_name}`, [...args, {
          ...component_instance,
          set_state: component_instance.setState.bind(component_instance),
          setState: component_instance.setState.bind(component_instance),
          ...(component_instance.compile_render_methods({}, {}, {}, typeof window === 'undefined' ? [] : null) || {}),
        }]);

        return method_function(...args, {
          ...component_instance,
          set_state: component_instance.setState.bind(component_instance),
          setState: component_instance.setState.bind(component_instance),
          ...(component_instance.compile_render_methods({}, {}, {}, typeof window === 'undefined' ? [] : null) || {}),
        });
      };
      return methods;
    },
    {}
  );
};

export default compile;
