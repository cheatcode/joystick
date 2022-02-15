import isWindows from './isWindows.js';

export default (path = '') => {
  // NOTE: This is why serial killers exist.
  return isWindows ? path.replace(/[a-zA-Z]:\\\\/gi, '') : path;
};