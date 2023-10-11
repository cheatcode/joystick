import fs from "fs";
import masterIgnoreList from "../masterIgnoreList.js";

export default (excludedPaths = []) => {
  const gitignore = fs.existsSync(".gitignore")
    ? fs.readFileSync(".gitignore", "utf-8")
    : "";
    
  const gitignoreFiles = gitignore?.split("\n")?.filter((file) => {
    return !file?.includes("#") && file?.trim() !== "";
  });

  // NOTE: The ^ character is an anchor to tell tar to only match the pattern
  // to the root path. Without this, it will match all nested paths that resemble
  // the pattern you give it. For example, ./versions will match the api/versions
  // directory too.
  const ignoreFiles = [
    ...(gitignoreFiles || [])?.map((ignore) => {
      return `^${ignore}`;
    }),
    ...(excludedPaths || [])?.map((ignore) => {
      return `^${ignore}`;
    }),
    ...(masterIgnoreList || [])?.map((ignore) => {
      return `^${ignore}`;
    }),
    "*.tar",
    "*.tar.gz",
    "*.tar.xz",
  ]?.filter((item, itemIndex, array) => {
    return array.indexOf(item) === itemIndex;
  });

  const excludeList = `{${ignoreFiles
    ?.map((ignoreFile) => `"${ignoreFile}"`)
    .join(",")}}`;

  return excludeList;
};
