import fs from "fs-extra";
import filesToCopy from "./filesToCopy.js";
import buildFile from "./buildFile.js";
const getFilePlatform = (path = "") => {
  let platform = "copy";
  const browserPaths = ["ui/", "lib/", "index.client.js"];
  const nodePaths = ["api/", "index.server.js"];
  const isBrowser = browserPaths.some((browserPath) => {
    return path.includes(browserPath);
  });
  const isNode = nodePaths.some((nodePath) => {
    return path.includes(nodePath);
  });
  if (isBrowser) {
    platform = "browser";
  }
  if (isNode) {
    platform = "node";
  }
  return platform;
};
var buildFiles_default = async (filesToBuild = []) => {
  return Promise.all(filesToBuild.map(async (fileToBuild) => {
    const isFileToCopy = filesToCopy.some((fileToCopy) => {
      return fileToBuild.includes(fileToCopy.path);
    });
    if (isFileToCopy) {
      return new Promise((resolve) => {
        fs.outputFileSync(`./.joystick/build/${fileToBuild}`, fs.readFileSync(fileToBuild));
        resolve();
      });
    }
    const platform = getFilePlatform(fileToBuild);
    return buildFile(fileToBuild, platform);
  }));
};
export {
  buildFiles_default as default
};
