export default (externalLibraryName = '', externalData = {}) => {
  if (typeof window !== 'undefined') {
    joystick._external[externalLibraryName] = {
      ...(joystick._external[externalLibraryName] || {}),
      ...externalData,
    };
  }
};