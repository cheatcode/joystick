import fs from "fs";
import { join } from "path";
const getFileListFromPath = (directoryPath = "", files = []) => {
  const filesInDirectory = fs.readdirSync(directoryPath);
  const filesWithDirectoryPathPrefix = filesInDirectory.map((filePathInDirectory = "") => {
    return join(directoryPath, filePathInDirectory);
  });
  files.push(...filesWithDirectoryPathPrefix);
  filesWithDirectoryPathPrefix.forEach((filePathWithDirectoryPrefix = "") => {
    const pathIsDirectory = fs.statSync(filePathWithDirectoryPrefix).isDirectory();
    if (pathIsDirectory) {
      getFileListFromPath(filePathWithDirectoryPrefix, files);
    }
  });
  return files;
};
var getFilesToBuild_default = () => {
  const files = getFileListFromPath("./");
  const filteredFiles = files.filter((path) => {
    return ![
      "node_modules",
      ".DS_Store",
      ".git",
      ".build",
      ".joystick",
      ".deploy",
      "storage",
      "uploads"
    ].some((excludedPath) => {
      return path.includes(excludedPath);
    });
  }).filter((path) => {
    return !fs.lstatSync(path).isDirectory();
  });
  return filteredFiles;
};
export {
  getFilesToBuild_default as default
};
