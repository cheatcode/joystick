import os from 'os';

const get_platform_safe_path = (path = '') => {
  // NOTE: This is why serial killers exist.
  return os.platform() === "win32" ? path.replace(/\//g, '\\') : path;
};

export default get_platform_safe_path;
