import fs from 'fs';
import path from 'path';
import os from 'os';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { execFile } from 'child_process';

const stream_pipeline = promisify(pipeline);
const exec_file_async = promisify(execFile);

const download_mongodb_linux = async () => {
  const base_directory = path.join(os.homedir(), '.joystick', 'databases', 'mongodb');
  const bin_directory = path.join(base_directory, 'bin');

  if (await check_if_file_exists(base_directory)) {
    return;
  }

  await create_directories(base_directory, bin_directory);

  const download_url = 'https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-ubuntu2204-7.0.2.tgz';
  const file_name = path.basename(new URL(download_url).pathname);
  const file_path = path.join(base_directory, file_name);

  if (await check_if_file_exists(file_path)) {
    return;
  }

  process.loader.print('MongoDB not found. Downloading... (patience is a virtue—it\'s chonky)');
  await download_file(download_url, file_path);
  process.loader.print('Installing MongoDB...');
  
  await exec_file_async('tar', ['-xzf', file_path, '-C', bin_directory, '--strip-components=1']);
  await fs.promises.unlink(file_path);

  await make_file_executable(bin_directory);
  process.loader.print('MongoDB installed!');
};

const download_file = async (url, file_path) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.statusText}`);
  }
  await stream_pipeline(response.body, fs.createWriteStream(file_path));
};

const check_if_file_exists = async (file_path) => {
  try {
    await fs.promises.access(file_path);
    return true;
  } catch {
    return false;
  }
};

const create_directories = async (base_directory, bin_directory) => {
  await fs.promises.mkdir(base_directory, { recursive: true });
  await fs.promises.mkdir(bin_directory, { recursive: true });
};

const make_file_executable = async (bin_directory) => {
  const files = await fs.promises.readdir(bin_directory);
  for (const file of files) {
    await fs.promises.chmod(path.join(bin_directory, file), '755');
  }
};

export default download_mongodb_linux;