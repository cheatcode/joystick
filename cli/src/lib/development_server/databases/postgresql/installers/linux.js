import fs from 'fs';
import path from 'path';
import os from 'os';
import { promisify } from 'util';
import { execFile } from 'child_process';
import { pipeline } from 'stream';

const execFileAsync = promisify(execFile);
const streamPipeline = promisify(pipeline);

const download_postgresql_linux = async (version_path = null) => {
  const base_directory = path.join(os.homedir(), '.joystick', 'databases', 'postgresql');
  const bin_directory = path.join(base_directory, 'bin');
  const data_directory = path.join(base_directory, 'data');

  if (await check_if_file_exists(base_directory)) {
    return;
  }

  await create_directories(base_directory, bin_directory);

  // Create joystick user if it doesn't exist
  await create_joystick_user();

  // Check and install dependencies
  await check_and_install_dependencies();

  const download_url = 'https://ftp.postgresql.org/pub/source/v16.0/postgresql-16.0.tar.gz';
  const file_name = path.basename(new URL(download_url).pathname);
  const file_path = path.join(base_directory, file_name);

  process.loader.print('PostgreSQL not found. Downloading...');
  await download_file(download_url, file_path);

  process.loader.print('Installing PostgreSQL...');
  
  // Extract PostgreSQL
  await execFileAsync('tar', ['-xzf', file_path, '-C', base_directory]);
  
  const extracted_dir = path.join(base_directory, 'postgresql-16.0');

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

  // Set permissions for joystick user
  await set_permissions_for_joystick_user(base_directory);

  // Clean up
  await fs.promises.unlink(file_path);
  await fs.promises.rm(extracted_dir, { recursive: true, force: true });

  await make_file_executable(bin_directory);
  process.loader.print('PostgreSQL installed!');

  // Create data directory
  await fs.promises.mkdir(data_directory, { recursive: true });

  process.loader.print('PostgreSQL installation completed!');
};

const create_joystick_user = async () => {
  try {
    await execFileAsync('id', ['-u', 'joystick']);
    console.log('Joystick user already exists');
  } catch (error) {
    console.log('Creating joystick user...');
    try {
      await execFileAsync('sudo', ['useradd', '-m', 'joystick']);
      console.log('Joystick user created successfully');
    } catch (error) {
      console.error('Error creating joystick user:', error);
      throw error;
    }
  }
};

const set_permissions_for_joystick_user = async (base_directory) => {
  try {
    await execFileAsync('sudo', ['chown', '-R', 'joystick:joystick', base_directory]);
    await execFileAsync('sudo', ['chmod', '-R', '755', base_directory]);
    console.log('Permissions set for joystick user');
  } catch (error) {
    console.error('Error setting permissions for joystick user:', error);
    throw error;
  }
};

const check_and_install_dependencies = async () => {
  const required_packages = ['gcc', 'make', 'libreadline-dev', 'zlib1g-dev'];
  const packages_to_install = [];

  for (const pkg of required_packages) {
    try {
      await execFileAsync('dpkg', ['-s', pkg]);
    } catch (error) {
      packages_to_install.push(pkg);
    }
  }

  if (packages_to_install.length > 0) {
    console.log(`Installing missing packages: ${packages_to_install.join(', ')}`);
    try {
      await execFileAsync('sudo', ['apt-get', 'update']);
      await execFileAsync('sudo', ['apt-get', 'install', '-y', ...packages_to_install]);
      console.log('All required packages installed successfully');
    } catch (error) {
      console.error('Error installing packages:', error);
      throw error;
    }
  } else {
    console.log('All required packages are already installed');
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

const create_directories = async (base_directory, bin_directory) => {
  await fs.promises.mkdir(base_directory, { recursive: true });
  await fs.promises.mkdir(bin_directory, { recursive: true });
};

const make_file_executable = async (directory) => {
  const files = await fs.promises.readdir(directory);
  for (const file of files) {
    await fs.promises.chmod(path.join(directory, file), '755');
  }
};

export default download_postgresql_linux;