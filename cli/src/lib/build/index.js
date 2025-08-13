import chalk from "chalk";
import child_process from "child_process";
import fs from 'fs';
import { dirname } from 'path';
import util from 'util';
import build_files from "./build_files.js";
import get_files_to_build from "./get_files_to_build.js";
import get_file_operation from "./get_file_operation.js";
import get_path_platform from "./get_path_platform.js";
import get_tar_ignore_list from "./get_tar_ignore_list.js";
import load_settings from "../load_settings.js";
import Loader from "../loader.js";
import path_exists from "../path_exists.js";
import encrypt_buffer from '../../lib/encrypt_buffer.js';

const { mkdir, copyFile, readFile, writeFile, readdir } = fs.promises;
const exec = util.promisify(child_process.exec);

const get_custom_copy_paths = async (copy_paths_from_settings = []) => {
  const custom_copy_paths = [];

  for (let i = 0; i < copy_paths_from_settings?.length; i += 1) {
    const custom_copy_path = copy_paths_from_settings[i];

    if (fs.existsSync(custom_copy_path)) {
      const stat = fs.lstatSync(custom_copy_path);

      if (stat.isDirectory()) {
        const paths = await readdir(custom_copy_path, { recursive: true });
        custom_copy_paths.push(
          ...(paths || [])?.map((path) => {
            return `${custom_copy_path}/${path}`;
          })
        );
      } else {
        custom_copy_paths.push(custom_copy_path);
      }
    }
  }

  return custom_copy_paths;
};

const get_files_to_build_with_operation_and_platform = (files = []) => {
  return files?.map((file) => {
    return {
      path: file,
      operation: get_file_operation(file),
      platform: get_path_platform(file),
    }
  });
};

const build = async (options = {}) => {
  const loader = new Loader();

  const build_type = options?.type || 'tar';
  const environment = options?.environment || "production";

  loader.print(`Building app to ${build_type} for ${environment}...`);

  const { settings } = await load_settings(environment);
  const excluded_paths = settings?.config?.build?.excluded_paths || settings?.config?.build?.excludedPaths;
  const custom_copy_paths = await get_custom_copy_paths(settings?.config?.build?.copy_paths);

  const files_for_build = await get_files_to_build(excluded_paths, custom_copy_paths);
  const output_path = build_type === 'tar' ? '.build/.tar' : '.build';
  const files_to_build_with_operation_and_platform = get_files_to_build_with_operation_and_platform(files_for_build);

  if (await path_exists('.build')) {
    await exec(`rm -rf .build`);
  }

  const files_to_copy = [
    ...files_to_build_with_operation_and_platform?.filter((file) => {
      return file?.operation === 'copy_file';
    }),
    ...(custom_copy_paths || [])?.map((custom_copy_path) => {
      return { path: custom_copy_path };
    }),
  ];

  const files_to_build = files_to_build_with_operation_and_platform?.filter((file) => {
    return file?.operation === 'build_file';
  });

  for (let i = 0; i < files_to_copy?.length; i += 1) {
    const file_to_copy = files_to_copy[i];
    const stat = fs.lstatSync(file_to_copy?.path);

    if (stat.isFile()) {
      await mkdir(dirname(`${output_path}/${file_to_copy?.path}`), { recursive: true });
      await copyFile(file_to_copy?.path, `${output_path}/${file_to_copy?.path}`);
    }
  }

  await build_files({
    files: files_to_build,
    environment,
    output_path,
  }).catch((error) => {
    console.warn(error);
  });

  if (build_type === "tar") {
    const ignore_list = get_tar_ignore_list(settings?.config?.build?.excludedPaths);

    await exec(
      `cd ${output_path} && tar --exclude=${ignore_list} -czf ../build.tar.gz .`
    );

    await exec(`rm -rf ${output_path}`);
  }

  if (build_type === "tar" && options?.encrypt_build) {
    const build_path = output_path?.replace('/.tar', '/build.tar.gz');

    const encrypted_build = encrypt_buffer(
      await readFile(build_path),
      options?.encryption_key,
    );

    await writeFile(`.build/build.encrypted.tar.gz`, encrypted_build);
  }

  if (!options?.silence_confirmation) {
    console.log(
      chalk.greenBright(`\n✔ App built as ${build_type} to ${build_type === 'tar' ? output_path?.replace('/.tar', '/build.tar.gz') : output_path}!\n`)
    );
  }

  if (await path_exists('.build/component_id_cache.json')) {
    await exec(`rm -rf .build/component_id_cache.json`);
  }
};

export default build;
