import fs from "fs-extra";
import filesToCopy from "./filesToCopy";
import buildFile from "./buildFile";

const getFileTarget = (path = "") => {
  let target = "umd";

  const nodePaths = ["api/", "index.server.js"];

  const isNode = nodePaths.some((nodePath) => {
    return path.includes(nodePath);
  });

  if (isNode) {
    target = "cjs";
  }

  return target;
};

export default async (filesToBuild = []) => {
  return Promise.all(
    filesToBuild.map(async (fileToBuild) => {
      const isFileToCopy = filesToCopy.some((fileToCopy) => {
        return fileToBuild.includes(fileToCopy.path);
      });

      if (isFileToCopy) {
        return new Promise((resolve) => {
          fs.outputFileSync(
            `./.joystick/build/${fileToBuild}`,
            fs.readFileSync(fileToBuild)
          );

          resolve();
        });
      }

      const target = getFileTarget(fileToBuild);
      return buildFile(fileToBuild, target);
    })
  );
};
