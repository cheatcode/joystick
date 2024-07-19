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

  if (await check_if_file_exists(base_directory)) {
    return;
  }

  await create_directories(base_directory, bin_directory);

  // Create postgres user if it doesn't exist
  await create_postgres_user();

  // Add postgres user to sudoers
  await add_postgres_to_sudoers();

  const download_url = 'https://www.postgresql.org/ftp/binary/v16.0/linux-x64/postgresql-16.0-1-linux-x64-binaries.tar.gz';
  const file_name = path.basename(new URL(download_url).pathname);
  const file_path = path.join(base_directory, file_name);

  process.loader.print('PostgreSQL not found. Downloading...');
  await download_file(download_url, file_path);

  process.loader.print('Installing PostgreSQL...');
  
  // Extract PostgreSQL
  await execFileAsync('tar', ['-xzf', file_path, '-C', base_directory, '--strip-components=1']);

  // Set permissions for postgres user
  await set_permissions_for_postgres_user(base_directory);

  // Clean up
  await fs.promises.unlink(file_path);

  process.loader.print('PostgreSQL installed!');
};

const create_postgres_user = async () => {
  try {
    await execFileAsync('id', ['-u', 'postgres']);
    console.log('Postgres user already exists');
  } catch (error) {
    console.log('Creating postgres user...');
    try {
      await execFileAsync('sudo', ['useradd', '-r', '-s', '/bin/bash', 'postgres']);
      console.log('Postgres user created successfully');
    } catch (error) {
      console.error('Error creating postgres user:', error);
      throw error;
    }
  }
};

const add_postgres_to_sudoers = async () => {
  const sudoers_entry = 'postgres ALL=(ALL) NOPASSWD: ALL';
  const temp_sudoers_file = '/tmp/joystick_sudoers';

  try {
    // Check if the entry already exists
    const { stdout: existing_sudoers } = await execFileAsync('sudo', ['cat', '/etc/sudoers']);
    if (existing_sudoers.includes(sudoers_entry)) {
      console.log('Postgres sudoers entry already exists');
      return;
    }

    // Write the new entry to a temporary file
    await fs.promises.writeFile(temp_sudoers_file, sudoers_entry + '\n');

    // Use visudo to safely check and add the new entry
    try {
      await execFileAsync('sudo', ['visudo', '-cf', temp_sudoers_file]);
      await execFileAsync('sudo', ['sh', '-c', `cat ${temp_sudoers_file} >> /etc/sudoers`]);
      console.log('Postgres sudoers entry added successfully');
    } catch (error) {
      console.error('Error in sudoers syntax:', error);
      throw new Error('Failed to add sudoers entry due to syntax error');
    }
  } catch (error) {
    console.error('Error adding postgres to sudoers:', error);
    throw error;
  } finally {
    // Clean up the temporary file
    await fs.promises.unlink(temp_sudoers_file).catch(() => {});
  }
};

const set_permissions_for_postgres_user = async (base_directory) => {
  try {
    // Set ownership of the base directory to postgres
    await execFileAsync('sudo', ['chown', '-R', 'postgres:postgres', base_directory]);
    await execFileAsync('sudo', ['chmod', '-R', '755', base_directory]);

    console.log('Permissions set for postgres user');
  } catch (error) {
    console.error('Error setting permissions for postgres user:', error);
    throw error;
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

export default download_postgresql_linux;