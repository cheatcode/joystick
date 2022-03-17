import fs from "fs-extra";
import filesToCopy from "./filesToCopy.js";
import buildFile from "./buildFile.js";
import getPlatformSafePath from "../../lib/getPlatformSafePath.js";

const getFilePlatform = (path = "") => {
  let platform = "copy";

  const browserPaths = [
    getPlatformSafePath("ui/"),
    getPlatformSafePath("lib/"),
    getPlatformSafePath("lib/browser"),
    "index.client.js"
  ];

  const browserExclusions = [
    getPlatformSafePath("lib/node")
  ];

  const nodePaths = [
    getPlatformSafePath("api/"),
    getPlatformSafePath("routes/"),
    getPlatformSafePath("fixtures/"),
    getPlatformSafePath("lib/node"),
    "index.server.js"
  ];

  const nodeExclusions = [
    getPlatformSafePath("lib/browser")
  ];

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
  const extension = path.split('.').pop();
  return extension && !extension.match(/\js$/);
};

export default async (filesToBuild = [], outputPath = null) => {
  return Promise.all(
    filesToBuild.map(async (fileToBuild) => {
      const platform = getFilePlatform(fileToBuild);
      const isFileToCopy = platform === 'copy' || isNotJavaScript(fileToBuild) || filesToCopy.some((fileToCopy) => {
        return fileToBuild.includes(fileToCopy.path);
      });

      if (isFileToCopy) {
        return new Promise((resolve) => {
          fs.outputFileSync(
            `${outputPath || './.joystick/build'}/${fileToBuild}`,
            fs.readFileSync(fileToBuild)
          );

          resolve();
        });
      }

      return buildFile(fileToBuild, platform, outputPath);
    })
  );
};
