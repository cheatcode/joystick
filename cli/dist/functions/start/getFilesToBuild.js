import fs from "fs";
import { join } from "path";
function rreaddirSync(dir, allFiles = []) {
  const files = fs.readdirSync(dir).map((f) => join(dir, f));
  allFiles.push(...files);
  files.forEach((f) => {
    fs.statSync(f).isDirectory() && rreaddirSync(f, allFiles);
  });
  return allFiles;
}
var getFilesToBuild_default = () => {
  const files = rreaddirSync("./");
  const filteredFiles = files.filter((path) => {
    return !["node_modules", ".joystick", ".deploy", "storage", "uploads"].some((excludedPath) => {
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
