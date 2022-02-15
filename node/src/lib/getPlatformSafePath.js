import os from 'os';

const isWindows = os.platform() === 'win32';
export default (path = '') => {
  // NOTE: This is why serial killers exist.
  return isWindows ? path.replace('/', '\\') : path;
};