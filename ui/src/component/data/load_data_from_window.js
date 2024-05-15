import compile_data from "./compile.js";
import decode_utf8_base64_string from "../../lib/decode_utf8_base64_string.js";

const load_data_from_window = (component_instance = {}) => {
  if (typeof window !== 'undefined') {
    console.time('DECODE BASE64');
    const decoded_data = decode_utf8_base64_string(window.__joystick_data__);
    console.timeEnd('DECODE BASE64');
    const decrypted_data_from_window = window.__joystick_data__ ? JSON.parse(decoded_data) : {};
    const data_from_window = (decrypted_data_from_window && decrypted_data_from_window[component_instance?.id]) || null;
    const request_from_window = window.__joystick_request__ || {};
    return compile_data(data_from_window, request_from_window, component_instance);
  }

  return component_instance?.data || {};
};

export default load_data_from_window;
