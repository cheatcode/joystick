import fs from 'fs';
import path_exists from '../../path_exists.js';

const { readFile } = fs.promises;

const read_file_dependency_map = async () => {
  const file_map_path = `.joystick/build/file_map.json`;

  if (await path_exists(file_map_path)) {
    const file_map_as_json = await readFile(file_map_path, "utf-8");
    const file_map = file_map_as_json ? JSON.parse(file_map_as_json) : {};
    return file_map;
  }

  return {};
};

export default read_file_dependency_map;
