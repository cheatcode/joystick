const get_joystick_environment = () => {
  if (typeof window !== 'undefined') {
    return window.__joystick_environment__;
  }

  if (typeof process !== 'undefined') {
    return process.env.NODE_ENV;
  }

  return null;
};

export default get_joystick_environment;
