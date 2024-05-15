const decrypt_data_on_window = () => {
  const raw_data = JSON.parse(window.__joystick_data__ || '{}');
  const decoded_data = Object.entries(raw_data)?.reduce((decoded, [key, value]) => {
    decoded[key] = decode_utf8_base64_string(value);
    return decoded;
  }, {});

  window.__joystick_data__ = decoded_data;
};

export default decrypt_data_on_window;
