import child_process from "child_process";
import Loader from "../../lib/loader.js";
import getFilesToBuild from "../start/getFilesToBuild.js";
import buildFiles from "../start/buildFiles.js";
import CLILog from "../../lib/CLILog.js";
import getTarIgnoreList from "./getTarIgnoreList.js";
import loadSettings from "../../lib/loadSettings.js";
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
  const environment = options?.environment || "production";
  const settings = await loadSettings(environment);
  const filesToBuild = getFilesToBuild(settings?.config?.build?.excludedPaths);
  const outputPath = ".build";
  const outputPathForBuildType = options?.type === "tar" ? `${outputPath}/.tar` : outputPath;
  await buildFiles(filesToBuild, outputPathForBuildType, environment).catch((error) => {
    console.warn(error);
  });
  if (options?.type === "tar") {
    const ignoreList = getTarIgnoreList(settings?.config?.build?.excludedPaths);
    child_process.execSync(`cd ${outputPath}/.tar && tar -cf ../build.tar.xz --exclude=${ignoreList} .`);
    child_process.execSync(`cd ${outputPath} && rm -rf .tar`);
  }
  loader.stable(`App built as ${options?.type} to ${outputPath}!`);
  loader.stop();
  return Promise.resolve();
};
export {
  build_default as default
};
