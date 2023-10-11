import fs from "fs";
import { join } from "path";
import masterIgnoreList from "../masterIgnoreList.js";

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


export default (excludedPaths = [], context = null) => {
  const files = getFileListFromPath("./");
  const masterIgnoreListFilteredForContext = context && context === 'start' ? masterIgnoreList?.filter((fileToIgnore) => {
    return !fileToIgnore.includes('settings');
  }) : masterIgnoreList;

  const filteredFiles = files
    .filter((path) => {
      const isExcluded = excludedPaths.some((excludedPath) => {
        return path.includes(excludedPath);
      });

      return !isExcluded;
    })
    .filter((path) => {
      return !masterIgnoreListFilteredForContext.some((excludedPath) => {
        return path.includes(excludedPath);
      });
    })
    .filter((path) => {
      return !fs.lstatSync(path).isDirectory();
    });

  return filteredFiles;
};
