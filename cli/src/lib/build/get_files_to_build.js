import fs from "fs";
import get_files_in_path from "../get_files_in_path.js";
import master_ignore_list from "./master_ignore_list.js";

const get_files_to_build = async (excluded_paths = [], custom_copy_paths = []) => {
  const files = await get_files_in_path("./", []);

  const filtered_files = files
    .filter((path) => {
      const is_custom_copy_path = custom_copy_paths.some((custom_copy_path) => {
        return path.includes(custom_copy_path);
      });

      return !is_custom_copy_path;
    })
    .filter((path) => {
      const is_excluded = excluded_paths.some((excluded_path) => {
        return path.includes(excluded_path);
      });

      return !is_excluded;
    })
    .filter((path) => {
      const is_excluded = master_ignore_list.some((excluded_path) => {
        return path.includes(excluded_path);
      });

      return !is_excluded;
    })
    .filter((path) => {
      return !fs.lstatSync(path).isDirectory();
    });

  return filtered_files;
};

export default get_files_to_build;
