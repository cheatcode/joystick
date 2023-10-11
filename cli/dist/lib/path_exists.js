import fs from "fs";
var path_exists_default = (path = "") => {
  return new Promise((resolve) => {
    fs.access(path, fs.constants.F_OK, (error) => {
      resolve(!error);
    });
  });
};
export {
  path_exists_default as default
};
