import fs from "fs";
import get_files_in_path from "../get_files_in_path.js";
import master_ignore_list from "./master_ignore_list.js";

const { stat } = fs.promises;

const get_files_to_build = async (excluded_paths = [], context = null) => {
  const files = await get_files_in_path("./", []);

  const master_ignore_list_filtered_for_context = context && context === 'start' ? master_ignore_list?.filter((file_to_ignore) => {
    return !file_to_ignore.includes('settings');
  }) : master_ignore_list;

  const filtered_files = files
    .filter((path) => {
      const is_excluded = excluded_paths.some((excluded_path) => {
        return path.includes(excluded_path);
      });

      return !is_excluded;
    })
    .filter((path) => {
      const is_excluded = master_ignore_list_filtered_for_context.some((excluded_path) => {
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
