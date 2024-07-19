import { promisify } from 'util';
import { execFile } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const exec_file_async = promisify(execFile);
const mkdir_async = promisify(fs.mkdir);
const symlink_async = promisify(fs.symlink);

const download_postgresql_linux = async () => {
  try {
    // Check if PostgreSQL is already installed
    try {
      await exec_file_async('which', ['psql']);
      return;
    } catch (error) {
      // PostgreSQL is not installed, proceed with installation
    }

    process.loader.print('PostgreSQL not found. Downloading... (this may take a few minutes)');
    await exec_file_async('sudo', ['apt-get', 'update']);
    await exec_file_async('sudo', ['apt-get', 'install', '-y', 'postgresql']);

    process.loader.print('PostgreSQL installed!');

    const postgresql_version = '14';
    const system_bin_path = `/usr/lib/postgresql/${postgresql_version}/bin`;
    const joystick_bin_path = path.join(os.homedir(), '.joystick', 'databases', 'postgresql', 'bin');
    const symlink_path = path.join(joystick_bin_path, 'bin');

    await mkdir_async(joystick_bin_path, { recursive: true });

    try {
      await symlink_async(system_bin_path, symlink_path);
    } catch (symlink_error) {
      // Do nothing if the symlink already exists.
    }

  } catch (error) {
    console.error('Error installing PostgreSQL:', error);
    throw error;
  }
};

export default download_postgresql_linux;