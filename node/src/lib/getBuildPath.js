import fs from 'fs';

export default () => {
  // NOTE: The fs.existsSync() check here is determining if we're running the app in a non-development
  // environment locally on our computer. If we do something like joystick start -e production locally,
  // we'll still have a .joystick/build folder (whereas in an actual production build, we do not). This
  // ensures that we don't break the render when looking for the built copy of a page/layout. Without this,
  // we accidentally pull back the root directory and attempt to render an unbuilt copy of the page/layout.
  if (['development', 'test'].includes(process.env.NODE_ENV) || fs.existsSync('.joystick/build')) {
    return '.joystick/build/';
  }

  return '';
};