import fs from "fs";
import generate_id from "../../generate_id.js";
import path_exists from "../../path_exists.js";

const { readFile, writeFile } = fs.promises;

const update_component_id_cache = async (component_id_targets = [], component_id_cache = {}, component_id_cache_path = '') => {
  for (let i = 0; i < component_id_targets.length; i += 1) {
    const component = component_id_targets[i];
    component_id_cache[component.path] = component.component_id;
    await writeFile(component_id_cache_path, JSON.stringify(component_id_cache));
  }
};

const inject_component_id = (component_id_targets = [], file = '') => {
  let updated_file = file;

  for (let i = 0; i < component_id_targets.length; i += 1) {
    const component = component_id_targets[i];

    const tainted = component.source.replace(
      /\.component\(\{+(?!\n + _componentId)/g,
      () => {
        return `.component({\n  _componentId: '${component.component_id}',`;
      }
    );

    updated_file = updated_file.replace(component.source, tainted);
  }

  return updated_file;
};

const get_component_id_targets = (file = '', component_paths_from_esbuild_output = [], component_id_cache = {}) => {
  return component_paths_from_esbuild_output?.map((component_path, component_path_index) => {
    const next_component_path = component_paths_from_esbuild_output[component_path_index + 1];
    const path_without_comment = component_path.path.replace("// ", "");

    return {
      path: path_without_comment,
      component_id: component_id_cache[path_without_comment] || generate_id(16),
      index: component_path.index,
      source: file.substring(
        component_path.index,
        next_component_path ? next_component_path.index : file.length
      ),
    };
  });
};

const get_component_paths_from_esbuild_output = (file = '') => {
  return [...file?.matchAll(/\/\/ ui+.*/gi), ...file?.matchAll(/\/\/ email+.*/gi)]?.map((match) => {
    return {
      path: match[0],
      index: match.index,
    };
  });
};

const get_existing_component_id_cache = async (component_id_cache_path = '') => {
  const has_component_id_cache = await path_exists(component_id_cache_path);

  if (has_component_id_cache) {
    const component_id_cache = await readFile(component_id_cache_path, 'utf-8');
    return JSON.parse(component_id_cache);
  }

  return {};
};

const get_component_id_cache_path = () => {
  return ['development', 'test'].includes(process.env.NODE_ENV)
    ? `./.joystick/build/component_id_cache.json`
    : `./.build/component_id_cache.json`;
};

const set_component_id = async (file = "") => {
  const component_id_cache_path = get_component_id_cache_path();
  const component_id_cache = await get_existing_component_id_cache(component_id_cache_path);
  const component_paths_from_esbuild_output = get_component_paths_from_esbuild_output(file);
  const component_id_targets = get_component_id_targets(file, component_paths_from_esbuild_output, component_id_cache);

  const file_with_component_id = inject_component_id(component_id_targets, file);
  await update_component_id_cache(component_id_targets, component_id_cache, component_id_cache_path);

  return file_with_component_id;
};

export default set_component_id;
