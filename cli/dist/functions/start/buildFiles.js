import fs from "fs-extra";
import esbuild from "esbuild";
import filesToCopy from "./filesToCopy.js";
import buildFile from "./buildFile.js";
import minifyFile from "./minifyFile.js";
import getPlatformSafePath from "../../lib/getPlatformSafePath.js";
const getFilePlatform = (path = "") => {
  let platform = "copy";
  const browserPaths = [
    getPlatformSafePath("email/"),
    getPlatformSafePath("lib/"),
    getPlatformSafePath("lib/browser"),
    getPlatformSafePath("ui/"),
    "index.client.js"
  ];
  const browserExclusions = [getPlatformSafePath("lib/node")];
  const nodePaths = [
    getPlatformSafePath("api/"),
    getPlatformSafePath("routes/"),
    getPlatformSafePath("fixtures/"),
    getPlatformSafePath("lib/node"),
    "index.server.js"
  ];
  const nodeExclusions = [getPlatformSafePath("lib/browser")];
  const isBrowser = browserPaths.some((browserPath) => {
    return path.includes(browserPath);
  }) && !browserExclusions.some((browserExclusionPath) => {
    return path.includes(browserExclusionPath);
  });
  const isNode = nodePaths.some((nodePath) => {
    return path.includes(nodePath);
  }) && !nodeExclusions.some((nodeExclusionPath) => {
    return path.includes(nodeExclusionPath);
  });
  if (isBrowser) {
    platform = "browser";
  }
  if (isNode) {
    platform = "node";
  }
  return platform;
};
const isNotJavaScript = (path = "") => {
  const extension = path.split(".").pop();
  return extension && !extension.match(/\js$/);
};
var buildFiles_default = async (filesToBuild = [], outputPath = null, environment = "development") => {
  return Promise.all(
    filesToBuild.map(async (fileToBuild) => {
      const platform = getFilePlatform(fileToBuild);
      const isFileToCopy = platform === "copy" || isNotJavaScript(fileToBuild) || filesToCopy.some((fileToCopy) => {
        return fileToCopy.regex.test(fileToBuild);
      });
      if (isFileToCopy) {
        fs.outputFileSync(
          `${outputPath || "./.joystick/build"}/${fileToBuild}`,
          fs.readFileSync(fileToBuild)
        );
        return fileToBuild;
      }
      const build = await buildFile(
        fileToBuild,
        platform,
        outputPath,
        environment
      );
      await minifyFile(`${outputPath || "./.joystick/build"}/${fileToBuild}`);
      return build;
    })
  );
};
export {
  buildFiles_default as default
};
