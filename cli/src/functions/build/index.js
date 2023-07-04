import child_process from "child_process";
import chalk from "chalk";
import Loader from "../../lib/loader.js";
import getFilesToBuild from "../start/getFilesToBuild.js";
import buildFiles from "../start/buildFiles.js";
import CLILog from "../../lib/CLILog.js";
import getTarIgnoreList from "./getTarIgnoreList.js";
import loadSettings from "../../lib/loadSettings.js";

export default async (args = {}, options = {}) => {
  if (!options?.type) {
    CLILog("Must pass a type for your build.", {
      level: "danger",
      docs: "https://cheatcode.co/docs/joystick/cli#build",
    });
    process.exit(0);
  }

  console.log("");
  const loader = new Loader({
    padding: options?.isDeploy ? "  " : "",
    defaultMessage: "Building app...",
  });
  loader.text("Building app...");

  const environment = options?.environment || "production";
  const settings = !options?.continuousIntegration
    ? await loadSettings(environment)
    : null;
  const filesToBuild = getFilesToBuild(settings?.config?.build?.excludedPaths);
  const outputPath = ".build";
  const outputPathForBuildType =
    options?.type === "tar" ? `${outputPath}/.tar` : outputPath;

  await buildFiles(
    filesToBuild,
    outputPathForBuildType,
    // NOTE: Treat standalone builds as being for production by default.
    environment
  ).catch((error) => {
    console.warn(error);
  });

  if (options?.type === "tar") {
    const ignoreList = getTarIgnoreList(settings?.config?.build?.excludedPaths);

    console.log(ignoreList);

    child_process.execSync(
      `cd ${outputPath}/.tar && tar -cf ../build.tar.xz --exclude=${ignoreList} .`
    );
    child_process.execSync(`cd ${outputPath} && rm -rf .tar`);
  }

  loader.stable("");
  loader.stop();

  console.log(
    chalk.greenBright(`App built as ${options?.type} to ${outputPath}!\n`)
  );

  return Promise.resolve();
};
