import fs from 'fs';
import path from 'path';
import os from 'os';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { execFile } from 'child_process';

const stream_pipeline = promisify(pipeline);
const exec_file_async = promisify(execFile);

const download_mongodb_windows = async () => {
  const base_directory = path.join(os.homedir(), '.joystick', 'databases', 'mongodb');
  const bin_directory = path.join(base_directory, 'bin');

  if (await check_if_file_exists(base_directory)) {
    return;
  }

  await create_directories(base_directory, bin_directory);

  const download_url = 'https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.2.zip';
  const file_name = path.basename(new URL(download_url).pathname);
  const file_path = path.join(base_directory, file_name);

  if (await check_if_file_exists(file_path)) {
    return;
  }

  process.loader.print('MongoDB not found. Downloading... (this may take a few minutes)');
  await download_file(download_url, file_path);
  process.loader.print('Installing MongoDB...');
  
  const temp_directory = path.join(base_directory, 'temp');
  await exec_file_async('powershell', ['Expand-Archive', '-Path', file_path, '-DestinationPath', temp_directory]);
  const extracted_folder = (await fs.promises.readdir(temp_directory))[0];
  const extracted_path = path.join(temp_directory, extracted_folder);
  
  // Remove existing bin directory if it exists
  if (await check_if_file_exists(bin_directory)) {
    await fs.promises.rm(bin_directory, { recursive: true, force: true });
  }
  
  // Copy the entire contents of the extracted folder to the bin directory
  await fs.promises.cp(extracted_path, bin_directory, { recursive: true });

  // Download and install mongosh
  const mongosh_url = 'https://downloads.mongodb.com/compass/mongosh-2.2.12-win32-x64.zip';
  const mongosh_file_path = path.join(base_directory, 'mongosh.zip');
  await download_file(mongosh_url, mongosh_file_path);
  
  const mongosh_temp_directory = path.join(base_directory, 'mongosh_temp');
  await exec_file_async('powershell', ['Expand-Archive', '-Path', mongosh_file_path, '-DestinationPath', mongosh_temp_directory]);
  
  const mongosh_extracted_folder = (await fs.promises.readdir(mongosh_temp_directory))[0];
  const mongosh_bin_path = path.join(mongosh_temp_directory, mongosh_extracted_folder, 'bin', 'mongosh.exe');
  
  await fs.promises.copyFile(mongosh_bin_path, path.join(bin_directory, 'bin', 'mongosh.exe'));
  
  // Clean up temporary files
  await fs.promises.unlink(file_path);
  await fs.promises.unlink(mongosh_file_path);
  await fs.promises.rm(temp_directory, { recursive: true, force: true });
  await fs.promises.rm(mongosh_temp_directory, { recursive: true, force: true });

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

export default download_mongodb_windows;