import fs from 'fs';

const get_build_path_for_environment = () => {
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

const get_joystick_build_path = () => {
  const build_path_for_environment = get_build_path_for_environment();

  return `${process.cwd().replace(build_path_for_environment, '')}/${build_path_for_environment}`;
};

export default get_joystick_build_path;
