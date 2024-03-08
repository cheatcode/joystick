import fs from "fs";
import master_ignore_list from "./master_ignore_list.js";

const get_tar_ignore_list = (excluded_paths = []) => {
  const git_ignore = fs.existsSync(".gitignore")
    ? fs.readFileSync(".gitignore", "utf-8")
    : "";
    
  const git_ignore_files = git_ignore?.split("\n")?.filter((file) => {
    return !file?.includes("#") && file?.trim() !== "";
  });

  // NOTE: The ^ character is an anchor to tell tar to only match the pattern
  // to the root path. Without this, it will match all nested paths that resemble
  // the pattern you give it. For example, ./versions will match the api/versions
  // directory too.
  const files_to_ignore = [
    ...(git_ignore_files || [])?.map((ignore) => {
      return `^${ignore}`;
    }),
    ...(excluded_paths || [])?.map((ignore) => {
      return `^${ignore}`;
    }),
    ...(master_ignore_list || [])?.map((ignore) => {
      return `^${ignore}`;
    }),
    "*.tar",
    "*.tar.gz",
    "*.tar.xz",
  ]?.filter((item, itemIndex, array) => {
    return array.indexOf(item) === itemIndex;
  });

  const exclude_list = `{${files_to_ignore
    ?.map((file_to_ignore) => `"${file_to_ignore}"`)
    .join(",")}}`;

  return exclude_list;
};

export default get_tar_ignore_list;
