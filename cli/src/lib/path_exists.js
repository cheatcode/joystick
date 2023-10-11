import fs from 'fs';

export default (path = '') => {
  return new Promise((resolve) => {
    fs.access(path, fs.constants.F_OK, error => {
      resolve(!error);
    });
  });
};
