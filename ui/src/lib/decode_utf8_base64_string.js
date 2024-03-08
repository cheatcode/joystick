const decode_utf8_base64_string = (base64_string = '') => {
  const binary_string = atob(base64_string);
  const byte_array = Uint8Array.from(binary_string, (m) => m.codePointAt(0));
  return new TextDecoder().decode(byte_array);
};

export default decode_utf8_base64_string;
