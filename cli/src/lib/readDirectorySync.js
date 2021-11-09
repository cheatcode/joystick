import fs from "fs";
import { join } from "path";

const readDirectorySync = (directory, allFiles = []) => {
  const files = fs.readdirSync(directory).map((file) => join(directory, file));
  allFiles.push(...files);
  files.forEach((file) => {
    fs.statSync(file).isDirectory() && readDirectorySync(file, allFiles);
  });
  return allFiles;
};

export default readDirectorySync;
