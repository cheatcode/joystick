import fs from "fs";
const path_exists = (path = "") => {
  return new Promise((resolve) => {
    fs.access(path, fs.constants.F_OK, (error) => {
      resolve(!error);
    });
  });
};
var path_exists_default = path_exists;
export {
  path_exists_default as default
};
