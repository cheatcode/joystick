import log from "../../lib/log.js";
import path_exists from '../../lib/path_exists.js';

const uncached_import = async (path = '', options = {}) => {
  // NOTE: Use timestamp to cache bust on import() below.
  const module_path = `${path}?update=${Date.now()}`
  const contents = await import(module_path);
  return (contents?.default && options?.default) ? contents.default : contents;
};

const load = async (path = '', options = {}) => {
  const sanitized_path = path?.charAt(0) === '/' ? path.substring(1, path.length) : path;
  const build_path = `${process.cwd()}/.joystick/build/${sanitized_path}`;

  if (!(await path_exists(build_path))) {
    log(`[test.load] Path at ${build_path} not found.`, {
      level: 'warning',
      docs: 'https://cheatcode.co/docs/joystick/test/load',
    });
    
    return null;
  }
  
  return uncached_import(build_path, options);
};

export default load;
