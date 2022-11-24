import child_process from "child_process";
import Loader from "../../lib/loader.js";
import getFilesToBuild from "../start/getFilesToBuild.js";
import buildFiles from "../start/buildFiles.js";
import CLILog from "../../lib/CLILog.js";
var build_default = async (args = {}, options = {}) => {
  if (!options?.type) {
    CLILog("Must pass a type for your build.", {
      level: "danger",
      docs: "https://cheatcode.co/docs/joystick/cli#build"
    });
    process.exit(0);
  }
  console.log("");
  const loader = new Loader({ padding: options?.isDeploy ? "  " : "", defaultMessage: "Building app..." });
  loader.text("Building app...");
  const filesToBuild = getFilesToBuild();
  const outputPath = ".build";
  await buildFiles(filesToBuild, options?.type === "tar" ? `${outputPath}/.tar` : outputPath).catch((error) => {
    console.warn(error);
  });
  if (options?.type === "tar") {
    child_process.execSync(`cd ${outputPath}/.tar && tar -cf ../build.tar.xz --use-compress-program='xz -9' --exclude={".build",".deploy",".git","uploads","storage",".DS_Store","*.tar","*.tar.gz","*.tar.xz"} .`);
    child_process.execSync(`cd ${outputPath} && rm -rf .tar`);
  }
  loader.stable(`App built as ${options?.type} to ${outputPath}!`);
  loader.stop();
  return Promise.resolve();
};
export {
  build_default as default
};
