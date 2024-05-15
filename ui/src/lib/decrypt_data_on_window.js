import decode_utf8_base64_string from "./decode_utf8_base64_string.js";

const decrypt_data_on_window = () => {
  window.__joystick_data__ = Object.entries(window.__joystick_data__ || {})?.reduce((decoded, [key, value]) => {
    decoded[key] = decode_utf8_base64_string(value);
    return decoded;
  }, {});
};

export default decrypt_data_on_window;
