export default (path = '', exception = {}) => {
  throw new Error(`[joystick${path ? `.${path}` : ''}] ${exception.message || exception.reason || exception}`);
};
