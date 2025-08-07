import fs from 'fs';
import path from 'path';
import os from 'os';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { execFile } from 'child_process';
import get_architecture from '../../get_architecture.js';

const stream_pipeline = promisify(pipeline);
const exec_file_async = promisify(execFile);

const database_versions = {
  mongodb: '8',
  postgresql: '17',
  redis: '7',
};

const database_display_names = {
  mongodb: 'MongoDB',
  postgresql: 'PostgreSQL',
  redis: 'Redis',
};

const get_platform = () => {
  const platform = os.platform();
  if (platform === 'darwin') return 'macos';
  if (platform === 'linux') return 'linux';
  throw new Error(`Unsupported platform: ${platform}. Please use WSL2 on Windows.`);
};


const build_download_url = (database, version, platform, architecture) => {
  const cache_buster = Date.now();
  return `https://cdn.joystickjs.com/${database}/${version}/${platform}/${architecture}.tar.gz?t=${cache_buster}`;
};

const check_if_file_exists = async (file_path) => {
  try {
    await fs.promises.access(file_path);
    return true;
  } catch {
    return false;
  }
};

const download_file = async (url, file_path) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.statusText}`);
  }
  await stream_pipeline(response.body, fs.createWriteStream(file_path));
};

const make_files_executable = async (directory) => {
  try {
    if (!(await check_if_file_exists(directory))) {
      return; // Directory doesn't exist, skip
    }

    const files = await fs.promises.readdir(directory);
    for (const file of files) {
      const file_path = path.join(directory, file);
      const stats = await fs.promises.stat(file_path);
      if (stats.isFile()) {
        await fs.promises.chmod(file_path, '755');
      } else if (stats.isDirectory()) {
        // Recursively make files executable in subdirectories
        await make_files_executable(file_path);
      }
    }
  } catch (error) {
    // Skip errors, but don't warn as this is expected during installation
  }
};

const install_database = async (database_name) => {
  const platform = get_platform();
  const architecture = get_architecture();
  const base_directory = path.join(os.homedir(), '.joystick', 'databases', database_name);
  const architecture_directory = path.join(base_directory, architecture);

  // Check if the architecture-specific directory exists
  if (await check_if_file_exists(architecture_directory)) {
    return; // Already installed for this architecture
  }

  const version = database_versions[database_name];

  if (!version) {
    throw new Error(`Unsupported database: ${database_name}`);
  }

  const download_url = build_download_url(database_name, version, platform, architecture);
  const archive_filename = `${database_name}.tar.gz`;
  const archive_path = path.join(base_directory, archive_filename);
  const display_name = database_display_names[database_name] || database_name;

  process.loader.print(`${display_name} (${architecture}) not found. Downloading... (this may take a few minutes)`);

  // Create the base directory
  await fs.promises.mkdir(base_directory, { recursive: true });
  await download_file(download_url, archive_path);

  process.loader.print(`Installing ${display_name} (${architecture})...`);

  // Create architecture directory and extract there
  await fs.promises.mkdir(architecture_directory, { recursive: true });
  await exec_file_async('tar', ['-xzf', archive_path, '-C', architecture_directory]);
  await fs.promises.unlink(archive_path);
  await make_files_executable(architecture_directory);

  process.loader.print(`${display_name} (${architecture}) installed!`);
};

export default install_database;
