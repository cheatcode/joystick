export default (externalLibraryName = '') => {
  if (joystick._external[externalLibraryName]) {
    return joystick._external[externalLibraryName];
  }
  
  return null;
};