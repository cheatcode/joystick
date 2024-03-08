import fs from 'fs';

const path_exists = (path = '') => {
  return new Promise((resolve) => {
    fs.access(path, fs.constants.F_OK, error => {
      resolve(!error);
    });
  });
};

export default path_exists;
