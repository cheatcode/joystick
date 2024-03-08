const get_platform_safe_path = (path = '') => {
  // NOTE: This is why serial killers exist.
  return process.platform === 'win32' ? path.replace('/', '\\') : path;
};

export default get_platform_safe_path;
