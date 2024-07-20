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
      await exec_file_async('which', ['pg_ctl']);
      console.log('PostgreSQL is already installed.');
      return;
    } catch (error) {
      // PostgreSQL is not installed, proceed with installation
    }

    process.loader.print('PostgreSQL not found. Installing... (this may take a few minutes)');
    
    // Install only the client and server packages without installing postgresql meta-package
    await exec_file_async('sudo', ['apt-get', 'update']);
    await exec_file_async('sudo', ['apt-get', 'install', '-y', 'postgresql-client-14', 'postgresql-server-dev-14']);

    process.loader.print('PostgreSQL binaries installed!');

    const postgresql_version = '14';
    const system_bin_path = `/usr/lib/postgresql/${postgresql_version}/bin`;
    const joystick_bin_path = path.join(os.homedir(), '.joystick', 'databases', 'postgresql');

    await mkdir_async(joystick_bin_path, { recursive: true });

    // Create symlink to the PostgreSQL bin directory
    try {
      await symlink_async(system_bin_path, path.join(joystick_bin_path, 'bin'));
      console.log(`Created symlink to PostgreSQL binaries in ${joystick_bin_path}`);
    } catch (symlink_error) {
      if (symlink_error.code === 'EEXIST') {
        console.log('Symlink already exists.');
      } else {
        console.error('Error creating symlink:', symlink_error);
        throw symlink_error;
      }
    }

    console.log('PostgreSQL binaries have been installed without creating or starting any clusters.');
    console.log('To create a cluster, you will need to run initdb manually.');

  } catch (error) {
    console.error('Error installing PostgreSQL:', error);
    throw error;
  }
};

export default download_postgresql_linux;