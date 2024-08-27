import fs from 'fs';
import get_platform_safe_path from '../../get_platform_safe_path.js';
import update_file_map from './update_file_map.js';

const { readFile } = fs.promises;

const generate_file_dependency_map = (build = {}) => {
  build.onLoad({ filter: /\.js$/ }, async (args) => {
    const can_add_to_map = !["node_modules", ".joystick", "?", "commonjsHelpers.js"].some((excluded_path) => {
      return get_platform_safe_path(args.path).includes(excluded_path);
    });

    if (can_add_to_map) {
      const code = await readFile(get_platform_safe_path(args.path), "utf-8");
      await update_file_map(get_platform_safe_path(args.path), code);
    }
  }).catch((error) => {
    console.log('GFDM ON LOAD', error);
  });
};

export default generate_file_dependency_map;
