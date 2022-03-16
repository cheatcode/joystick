import Loader from "../../lib/loader.js";
import getFilesToBuild from "../start/getFilesToBuild.js";
import buildFiles from "../start/buildFiles.js";
var build_default = (options = {}) => {
  console.log("");
  const loader = new Loader({ padding: options?.isDeploy ? "  " : "", defaultMessage: "Building app..." });
  loader.text("Building app...");
  const filesToBuild = getFilesToBuild();
  return buildFiles(filesToBuild, options?.outputPath).then((response) => {
    loader.pause("App built to .joystick/build!\n");
    console.log("");
  }).catch((error) => {
    console.warn(error);
  });
};
export {
  build_default as default
};
