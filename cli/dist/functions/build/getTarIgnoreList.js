import fs from "fs";
import masterIgnoreList from "../../lib/masterIgnoreList.js";
var getTarIgnoreList_default = (excludedPaths = []) => {
  const gitignore = fs.existsSync(".gitignore") ? fs.readFileSync(".gitignore", "utf-8") : "";
  const gitignoreFiles = gitignore?.split("\n")?.filter((file) => {
    return !file?.includes("#") && file?.trim() !== "";
  });
  const ignoreFiles = [
    ...gitignoreFiles,
    ...excludedPaths,
    ...(masterIgnoreList || [])?.map((ignore) => {
      return `${process.cwd()}/${ignore}`;
    }),
    "*.tar",
    "*.tar.gz",
    "*.tar.xz"
  ]?.filter((item, itemIndex, array) => {
    return array.indexOf(item) === itemIndex;
  });
  const excludeList = `{${ignoreFiles?.map((ignoreFile) => `"${ignoreFile}"`).join(",")}}`;
  return excludeList;
};
export {
  getTarIgnoreList_default as default
};
