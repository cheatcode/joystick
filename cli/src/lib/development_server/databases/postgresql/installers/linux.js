import { promisify } from 'util';
import { execFile } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const exec_file_async = promisify(execFile);
const mkdir_async = promisify(fs.mkdir);
const symlink_async = promisify(fs.symlink);
const access_async = promisify(fs.access);

const download_postgresql_linux = async () => {
  try {
    const postgresql_version = '16';
    const system_bin_path = `/usr/lib/postgresql/${postgresql_version}/bin`;
    const joystick_bin_path = path.join(os.homedir(), '.joystick', 'databases', 'postgresql', 'bin');
    const symlink_path = path.join(joystick_bin_path, 'bin');
    const postgres_executable = path.join(symlink_path, 'postgres');

    // Check if PostgreSQL is already installed in the desired location
    try {
      await access_async(postgres_executable, fs.constants.X_OK);
      return;
    } catch (error) {
      // PostgreSQL is not installed or not in the desired location, proceed with installation
    }

    process.loader.print('PostgreSQL not found. Installing... (this may take a few minutes)');
    
    // Ensure wget is installed
    await exec_file_async('sudo', ['apt-get', 'install', '-y', 'wget']);

    // Add PostgreSQL 16 repository
    await exec_file_async('sudo', ['sh', '-c', 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list']);
    
    // Download and add the PostgreSQL public key
    await exec_file_async('wget', ['--quiet', '-O', '-', 'https://www.postgresql.org/media/keys/ACCC4CF8.asc', '|', 'sudo', 'apt-key', 'add', '-']);

    // Update package list and install PostgreSQL 16
    await exec_file_async('sudo', ['apt-get', 'update']);
    await exec_file_async('sudo', ['apt-get', 'install', '-y', `postgresql-${postgresql_version}`, `postgresql-client-${postgresql_version}`, `postgresql-server-dev-${postgresql_version}`]);

    await mkdir_async(joystick_bin_path, { recursive: true });
    
    try {
      await symlink_async(system_bin_path, symlink_path);
    } catch (symlink_error) {
      if (symlink_error.code !== 'EEXIST') {
        console.error('Error creating symlink:', symlink_error);
        throw symlink_error;
      }
    }

    try {
      await access_async(postgres_executable, fs.constants.X_OK);
    } catch (access_error) {
      console.error('Error accessing PostgreSQL executable:', access_error);
      throw access_error;
    }
    
    process.loader.print('PostgreSQL installed!');
  } catch (error) {
    console.error('Error installing PostgreSQL:', error);
    throw error;
  }
};

export default download_postgresql_linux;