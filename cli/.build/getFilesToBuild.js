import fs from "fs";
import { join } from "path";

const getFileListFromPath = (directoryPath = '', files = []) => {
  const filesInDirectory = fs.readdirSync(directoryPath);
  const filesWithDirectoryPathPrefix = filesInDirectory.map((filePathInDirectory = '') => {
    return join(directoryPath, filePathInDirectory);
  });

  files.push(...filesWithDirectoryPathPrefix);

  filesWithDirectoryPathPrefix.forEach((filePathWithDirectoryPrefix = '') => {
    const pathIsDirectory = fs.statSync(filePathWithDirectoryPrefix).isDirectory();

    if (pathIsDirectory) {
      getFileListFromPath(filePathWithDirectoryPrefix, files);
    }
  });

  return files;
};

export default () => {
  const files = getFileListFromPath("./src");

  const filteredFiles = files.filter((path) => {
    return (
      !fs.lstatSync(path).isDirectory() &&
      !["node_modules", ".DS_Store"].some(
        (excludedPath) => {
          return path.includes(excludedPath);
        }
      )
    );
  });

  return filteredFiles;
};
