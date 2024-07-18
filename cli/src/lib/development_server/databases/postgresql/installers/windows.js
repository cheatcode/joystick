import fs from 'fs';
import path from 'path';
import os from 'os';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { execFile } from 'child_process';

const streamPipeline = promisify(pipeline);
const execFileAsync = promisify(execFile);

const download_postgresql_windows = async (version_path = null) => {
  const base_directory = path.join(os.homedir(), '.joystick', 'databases', 'postgresql');
  const bin_directory = path.join(base_directory, 'bin');
  const bin_bin_directory = path.join(bin_directory, 'bin');

  if (await check_if_file_exists(base_directory)) {
    return;
  }

  await create_directories(base_directory, bin_directory, bin_bin_directory);

  const download_url = 'https://get.enterprisedb.com/postgresql/postgresql-16.0-1-windows-x64-binaries.zip';
  const file_name = path.basename(new URL(download_url).pathname);
  const file_path = path.join(base_directory, file_name);

  process.loader.print('PostgreSQL not found. Downloading... (this may take a few minutes)');
  await download_file(download_url, file_path);

  process.loader.print('Installing PostgreSQL...');
  
  // Extract PostgreSQL
  const temp_directory = path.join(base_directory, 'temp');
  await fs.promises.mkdir(temp_directory, { recursive: true });
  await execFileAsync('powershell', ['Expand-Archive', '-Path', file_path, '-DestinationPath', temp_directory]);

  // Move binaries to bin/bin
  const extracted_bin_path = path.join(temp_directory, 'pgsql', 'bin');
  const files = await fs.promises.readdir(extracted_bin_path);
  for (const file of files) {
    await fs.promises.rename(path.join(extracted_bin_path, file), path.join(bin_bin_directory, file));
  }

  // Move other necessary directories
  const directories_to_move = ['share', 'lib', 'include'];
  for (const dir of directories_to_move) {
    const src_path = path.join(temp_directory, 'pgsql', dir);
    const dest_path = path.join(bin_directory, dir);
    if (await fs.promises.access(src_path).then(() => true).catch(() => false)) {
      await fs.promises.rename(src_path, dest_path);
    }
  }

  // Clean up
  await fs.promises.unlink(file_path);
  await fs.promises.rm(temp_directory, { recursive: true, force: true });

  process.loader.print('PostgreSQL installed!');
};

const download_file = async (url, file_path) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.statusText}`);
  }
  await streamPipeline(response.body, fs.createWriteStream(file_path));
};

const check_if_file_exists = async (file_path) => {
  try {
    await fs.promises.access(file_path);
    return true;
  } catch {
    return false;
  }
};

const create_directories = async (base_directory, bin_directory, bin_bin_directory) => {
  await fs.promises.mkdir(base_directory, { recursive: true });
  await fs.promises.mkdir(bin_directory, { recursive: true });
  await fs.promises.mkdir(bin_bin_directory, { recursive: true });
};

export default download_postgresql_windows;