import { resolve } from "path";
import { readdir } from "fs/promises";
async function* getFiles(directory) {
  const directoryFiles = await readdir(directory, { withFileTypes: true });
  for (const directoryFile of directoryFiles) {
    const res = resolve(directory, directoryFile.name);
    if (directoryFile.isDirectory()) {
      yield* getFiles(res);
    } else {
      yield res;
    }
  }
}
async function readDirectory(path = "") {
  const files = [];
  for await (const file of getFiles(path)) {
    files.push(file);
  }
  return files;
}
var readDirectory_default = readDirectory;
export {
  readDirectory_default as default
};
