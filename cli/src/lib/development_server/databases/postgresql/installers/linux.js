import fs from 'fs';
import path from 'path';
import os from 'os';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { execFile } from 'child_process';

const streamPipeline = promisify(pipeline);
const execFileAsync = promisify(execFile);

const download_postgresql_linux = async (version_path = null) => {
  const base_directory = path.join(os.homedir(), '.joystick', 'databases', 'postgresql');
  const bin_directory = path.join(base_directory, 'bin');
  const bin_bin_directory = path.join(bin_directory, 'bin');

  if (await check_if_file_exists(base_directory)) {
    return;
  }

  await create_directories(base_directory, bin_directory, bin_bin_directory);

  const download_url = 'https://ftp.postgresql.org/pub/source/v16.0/postgresql-16.0.tar.gz';
  const file_name = path.basename(new URL(download_url).pathname);
  const file_path = path.join(base_directory, file_name);

  process.loader.print('PostgreSQL not found. Downloading...');
  await download_file(download_url, file_path);

  process.loader.print('Installing PostgreSQL...');
  
  // Extract PostgreSQL
  await execFileAsync('tar', ['-xzf', file_path, '-C', base_directory]);
  
  const extracted_dir = path.join(base_directory, 'postgresql-16.0');

  // Check for dependencies
  await check_dependencies();

  // Configure and build
  try {
    await execFileAsync('./configure', ['--prefix=' + bin_directory, '--without-icu'], { cwd: extracted_dir });
  } catch (error) {
    console.error('Error during PostgreSQL configuration:', error);
    throw error;
  }

  try {
    await execFileAsync('make', [], { cwd: extracted_dir });
  } catch (error) {
    console.error('Error during PostgreSQL build:', error);
    throw error;
  }

  try {
    await execFileAsync('make', ['install'], { cwd: extracted_dir });
  } catch (error) {
    console.error('Error during PostgreSQL installation:', error);
    throw error;
  }

  // Clean up
  await fs.promises.unlink(file_path);
  await fs.promises.rm(extracted_dir, { recursive: true, force: true });

  await make_file_executable(bin_bin_directory);
  process.loader.print('PostgreSQL installed!');
};

const check_dependencies = async () => {
  const required_packages = ['gcc', 'make', 'libreadline-dev', 'zlib1g-dev'];
  for (const pkg of required_packages) {
    try {
      await execFileAsync('dpkg', ['-s', pkg]);
    } catch (error) {
      console.error(`Required package '${pkg}' is not installed.`);
      console.error('Please install the necessary dependencies. For Ubuntu or Debian, run:');
      console.error(`sudo apt-get update && sudo apt-get install ${required_packages.join(' ')}`);
      throw new Error('Missing dependencies');
    }
  }
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

export default download_postgresql_linux;