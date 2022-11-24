import fs from "fs";
var checkIfDeploymentTokenExists_default = () => {
  return fs.existsSync(".deploy/token");
};
export {
  checkIfDeploymentTokenExists_default as default
};
