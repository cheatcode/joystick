import generate_joystick_error_page from './generate_joystick_error_page.js';

const build_error_middleware = (_req, res, next) => {
  if (process.BUILD_ERROR) {
    const error = process.BUILD_ERROR.paths && process.BUILD_ERROR.paths[0];
    const joystick_error_page = generate_joystick_error_page({
      path: error.path,
      stack: error.error.stack,
      frame: error.error.snippet,
    });

    return res.send(joystick_error_page);
  }

  next();
};

export default build_error_middleware;
