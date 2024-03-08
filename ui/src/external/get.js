const get = (external_library_name = '') => {
  if (joystick._external[external_library_name]) {
    return joystick._external[external_library_name];
  }
  
  return null;
};

export default get;
