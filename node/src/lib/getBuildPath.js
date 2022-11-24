export default () => {
  if (process.env.NODE_ENV === 'development') {
    return '.joystick/build/';
  }

  return '';
};