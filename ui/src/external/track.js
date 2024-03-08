const track = (external_library_name = '', external_data = {}) => {
  if (typeof window !== 'undefined') {
    joystick._external[external_library_name] = {
      ...(joystick._external[external_library_name] || {}),
      ...external_data,
    };
  }
};

export default track;
