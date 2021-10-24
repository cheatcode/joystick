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

export default () => {
  const files = rreaddirSync("./");
  const filteredFiles = files
    .filter((path) => {
      return !["node_modules", ".joystick"].some((excludedPath) => {
        return path.includes(excludedPath);
      });
    })
    .filter((path) => {
      return !fs.lstatSync(path).isDirectory();
    });

  return filteredFiles;
};
