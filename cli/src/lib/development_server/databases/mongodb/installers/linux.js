import fs from 'fs';
import path from 'path';
import os from 'os';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { execFile } from 'child_process';

const streamPipeline = promisify(pipeline);
const execFileAsync = promisify(execFile);

const download_mongodb_linux = async (version_path = null) => {
  const base_directory = path.join(os.homedir(), '.joystick', 'databases', 'mongodb');
  const bin_directory = path.join(base_directory, 'bin');
  const bin_bin_directory = path.join(bin_directory, 'bin');

  if (await check_if_file_exists(base_directory)) {
    return;
  }

  await create_directories(base_directory, bin_directory, bin_bin_directory);

  const mongodb_url = 'https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-ubuntu2204-7.0.2.tgz';
  const mongosh_url = 'https://downloads.mongodb.com/compass/mongosh-2.2.12-linux-x64.tgz';

  const mongodb_file_name = path.basename(new URL(mongodb_url).pathname);
  const mongodb_file_path = path.join(base_directory, mongodb_file_name);

  const mongosh_file_name = path.basename(new URL(mongosh_url).pathname);
  const mongosh_file_path = path.join(base_directory, mongosh_file_name);

  process.loader.print('MongoDB not found. Downloading... (this may take a few minutes)');
  await download_file(mongodb_url, mongodb_file_path);
  await download_file(mongosh_url, mongosh_file_path);

  process.loader.print('Installing MongoDB...');
  
  // Extract MongoDB
  await execFileAsync('tar', ['-xzf', mongodb_file_path, '-C', base_directory]);
  const mongodb_extracted_dir = (await fs.promises.readdir(base_directory)).find(dir => dir.startsWith('mongodb-'));
  if (!mongodb_extracted_dir) {
    throw new Error('Could not find extracted MongoDB directory');
  }
  const mongodb_bin_path = path.join(base_directory, mongodb_extracted_dir, 'bin');
  
  // Move MongoDB binaries to bin/bin
  const mongodb_binaries = await fs.promises.readdir(mongodb_bin_path);
  for (const binary of mongodb_binaries) {
    await fs.promises.rename(path.join(mongodb_bin_path, binary), path.join(bin_bin_directory, binary));
  }
  
  // Extract mongosh
  const mongosh_temp_directory = path.join(base_directory, 'mongosh_temp');
  await fs.promises.mkdir(mongosh_temp_directory, { recursive: true });
  await execFileAsync('tar', ['-xzf', mongosh_file_path, '-C', mongosh_temp_directory]);
  
  // Find and copy mongosh executable
  const mongosh_contents = await fs.promises.readdir(mongosh_temp_directory);
  const mongosh_dir = mongosh_contents.find(item => item.startsWith('mongosh-'));
  if (!mongosh_dir) {
    throw new Error('Could not find mongosh directory in extracted contents');
  }
  
  const mongosh_bin_path = path.join(mongosh_temp_directory, mongosh_dir, 'bin', 'mongosh');
  const final_mongosh_path = path.join(bin_bin_directory, 'mongosh');
  await fs.promises.copyFile(mongosh_bin_path, final_mongosh_path);

  // Clean up
  await fs.promises.unlink(mongodb_file_path);
  await fs.promises.unlink(mongosh_file_path);
  await fs.promises.rm(mongosh_temp_directory, { recursive: true, force: true });
  await fs.promises.rm(path.join(base_directory, mongodb_extracted_dir), { recursive: true, force: true });

  await make_file_executable(bin_bin_directory);
  process.loader.print('MongoDB and MongoDB Shell installed!');
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

const make_file_executable = async (directory) => {
  const files = await fs.promises.readdir(directory);
  for (const file of files) {
    await fs.promises.chmod(path.join(directory, file), '755');
  }
};

export default download_mongodb_linux;