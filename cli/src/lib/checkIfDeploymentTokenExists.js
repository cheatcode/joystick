import fs from 'fs';

export default () => {
  return fs.existsSync('.deploy/token');
};