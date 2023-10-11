import child_process from "child_process";
import chalk from "chalk";
import fs from "fs";
import Loader from "../loader.js";
import getFilesToBuild from "./getFilesToBuild.js";
import buildFiles from "./buildFiles.js";
import getTarIgnoreList from "./getTarIgnoreList.js";
import loadSettings from "../loadSettings.js";
import encrypt_buffer from "../encrypt_buffer.js";
import decrypt_buffer from "../decrypt_buffer.js";
var build_default = async (options = {}) => {
  process.loader = new Loader();
  const buildType = options?.type || "tar";
  const environment = options?.environment || "production";
  process.loader.print(`Building app to ${buildType} for ${environment}...`);
  const settings = await loadSettings(environment);
  const excludedPaths = settings?.config?.build?.excludedPaths;
  const filesToBuild = getFilesToBuild(excludedPaths);
  const outputPath = buildType === "tar" ? ".build/.tar" : ".build";
  if (fs.existsSync(".build")) {
    child_process.execSync(`rm -rf .build`);
  }
  await buildFiles({
    files: filesToBuild,
    environment,
    outputPath
  }).catch((error) => {
    console.warn(error);
  });
  if (buildType === "tar") {
    const ignoreList = getTarIgnoreList(settings?.config?.build?.excludedPaths);
    child_process.execSync(
      `cd ${outputPath} && tar --exclude=${ignoreList} -czf ../build.tar.gz .`
    );
    child_process.execSync(`rm -rf ${outputPath}`);
  }
  if (buildType === "tar" && options?.encrypt_build) {
    const build_path = outputPath?.replace("/.tar", "/build.tar.gz");
    const encrypted_build = encrypt_buffer(
      fs.readFileSync(build_path),
      options?.encryption_key
    );
    fs.writeFileSync(`.build/build.encrypted.tar.gz`, encrypted_build);
  }
  if (!options?.silence_confirmation) {
    console.log(
      chalk.greenBright(`
App built as ${buildType} to ${buildType === "tar" ? outputPath?.replace("/.tar", "/build.tar.gz") : outputPath}!
`)
    );
  }
  if (fs.existsSync(".build/componentMap.json")) {
    child_process.execSync(`rm -rf .build/componentMap.json`);
  }
  return Promise.resolve();
};
export {
  build_default as default
};
