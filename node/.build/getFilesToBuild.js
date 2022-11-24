import fs from "fs";
import { join } from "path";

function rreaddirSync(directory, allFiles = []) {
  const files = fs.readdirSync(directory).map((file) => join(directory, file));
  allFiles.push(...files);
  files.forEach((f) => {
    fs.statSync(f).isDirectory() && rreaddirSync(f, allFiles);
  });
  return allFiles;
}

export default () => {
  const files = rreaddirSync("./src");

  const filteredFiles = files.filter((path) => {
    return (
      !fs.lstatSync(path).isDirectory() &&
      !["node_modules", ".DS_Store", "src/tests"].some((excludedPath) => {
        return path.includes(excludedPath);
      })
    );
  });

  return filteredFiles;
};
