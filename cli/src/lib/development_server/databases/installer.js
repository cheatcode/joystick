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

const make_files_executable = async (directory, database_name = null) => {
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

const setup_postgresql_permissions = async (directory) => {
  if (process.platform !== 'linux' || !process.getuid || process.getuid() !== 0) {
    return; // Only run on Linux as root
  }

  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const exec_async = promisify(exec);

  try {
    // Check if postgres user exists, create if not
    try {
      await exec_async('id postgres');
      console.log('PostgreSQL setup: postgres user already exists');
    } catch (error) {
      // User doesn't exist, create it with a proper shell
      console.log('PostgreSQL setup: creating postgres user');
      await exec_async('useradd -r -s /bin/bash postgres');
    }

    // Set up directory permissions for postgres user access
    const homedir = require('os').homedir();
    console.log('PostgreSQL setup: setting directory permissions');
    await exec_async(`chmod 755 ${homedir}`);
    await exec_async(`chmod 755 ${path.join(homedir, '.joystick')}`);
    await exec_async(`chmod 755 ${path.join(homedir, '.joystick', 'databases')}`);
    await exec_async(`chmod 755 ${path.join(homedir, '.joystick', 'databases', 'postgresql')}`);

    // Change ownership of the entire PostgreSQL installation to postgres user
    console.log('PostgreSQL setup: changing ownership to postgres user');
    await exec_async(`chown -R postgres:postgres ${directory}`);
    
    console.log('PostgreSQL setup: completed successfully');
  } catch (error) {
    // If we can't set up postgres user, continue anyway
    console.warn(`Warning: Could not set up postgres user ownership: ${error.message}`);
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

  // Extract to base directory first to check structure
  await exec_file_async('tar', ['-xzf', archive_path, '-C', base_directory]);
  await fs.promises.unlink(archive_path);

  // Check if tar file already created architecture directory
  const extracted_arch_dir = path.join(base_directory, architecture);
  if (await check_if_file_exists(extracted_arch_dir)) {
    // Tar file already contains architecture directory, we're done
    await make_files_executable(extracted_arch_dir);
    if (database_name === 'postgresql') {
      await setup_postgresql_permissions(extracted_arch_dir);
    }
  } else {
    // Tar file contains flat binaries, move them to architecture directory
    await fs.promises.mkdir(architecture_directory, { recursive: true });
    const files = await fs.promises.readdir(base_directory);
    
    for (const file of files) {
      const source_path = path.join(base_directory, file);
      const dest_path = path.join(architecture_directory, file);
      
      // Skip directories (existing architecture folders) and the one we just created
      const stats = await fs.promises.stat(source_path);
      if (stats.isDirectory()) continue;
      
      await fs.promises.rename(source_path, dest_path);
    }
    
    await make_files_executable(architecture_directory);
    if (database_name === 'postgresql') {
      await setup_postgresql_permissions(architecture_directory);
    }
  }

  process.loader.print(`${display_name} (${architecture}) installed!`);
};

export default install_database;
