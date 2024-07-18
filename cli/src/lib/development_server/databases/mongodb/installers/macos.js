import fs from 'fs';
import path from 'path';
import os from 'os';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { execFile } from 'child_process';

const streamPipeline = promisify(pipeline);
const execFileAsync = promisify(execFile);

const download_mongodb_macos = async (version_path = null) => {
  const base_directory = path.join(os.homedir(), '.joystick', 'databases', 'mongodb');
  const bin_directory = path.join(base_directory, 'bin');
  const bin_bin_directory = path.join(bin_directory, 'bin');

  if (await check_if_file_exists(base_directory)) {
    return;
  }

  await create_directories(base_directory, bin_directory, bin_bin_directory);

  const cpu_info = await get_cpu_info();
  const is_arm = cpu_info.includes('ARM');
  
  const mongodb_url = is_arm
    ? 'https://fastdl.mongodb.org/osx/mongodb-macos-arm64-7.0.2.tgz'
    : 'https://fastdl.mongodb.org/osx/mongodb-macos-x86_64-7.0.2.tgz';

  const mongosh_url = is_arm
    ? 'https://downloads.mongodb.com/compass/mongosh-2.2.12-darwin-arm64.zip'
    : 'https://downloads.mongodb.com/compass/mongosh-2.2.12-darwin-x64.zip';

  const mongodb_file_name = path.basename(new URL(mongodb_url).pathname);
  const mongodb_file_path = path.join(base_directory, mongodb_file_name);

  const mongosh_file_name = path.basename(new URL(mongosh_url).pathname);
  const mongosh_file_path = path.join(base_directory, mongosh_file_name);

  process.loader.print('MongoDB not found. Downloading... (patience is a virtue—it\'s chonky)');
  await download_file(mongodb_url, mongodb_file_path);
  await download_file(mongosh_url, mongosh_file_path);

  process.loader.print('Installing MongoDB...');
  
  // Extract MongoDB
  await execFileAsync('tar', ['-xzf', mongodb_file_path, '-C', bin_directory, '--strip-components=1']);
  
  // Extract mongosh
  const mongosh_temp_directory = path.join(base_directory, 'mongosh_temp');
  await fs.promises.mkdir(mongosh_temp_directory, { recursive: true });
  await execFileAsync('unzip', ['-q', mongosh_file_path, '-d', mongosh_temp_directory]);
  
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

  await make_file_executable(bin_directory);
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

const get_cpu_info = async () => {
  const { stdout } = await execFileAsync('sysctl', ['-n', 'machdep.cpu.brand_string']);
  return stdout.trim();
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

export default download_mongodb_macos;