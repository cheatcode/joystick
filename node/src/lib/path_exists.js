import fs from 'fs';
import get_platform_safe_path from './get_platform_safe_path.js';

const path_exists = (path = '') => {
  return new Promise((resolve) => {
    fs.access(get_platform_safe_path(path), fs.constants.F_OK, error => {
      resolve(!error);
    });
  });
};

export default path_exists;
