import compile_data from "./compile.js";

const load_data_from_window = (component_instance = {}) => {
  if (typeof window !== 'undefined') {
    const data_from_window = (window.__joystick_data__ && window.__joystick_data__[component_instance?.id]) || null;
    const request_from_window = window.__joystick_request__ || {};
    return compile_data(data_from_window, request_from_window, component_instance);
  }

  return component_instance?.data || {};
};

export default load_data_from_window;
