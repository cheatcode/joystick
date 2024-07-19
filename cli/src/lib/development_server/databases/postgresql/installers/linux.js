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
  await set_permissions_for_joystick_user(bin_directory);

  // Clean up
  await fs.promises.unlink(file_path);
  await fs.promises.rm(extracted_dir, { recursive: true, force: true });

  await make_file_executable(bin_bin_directory);
  process.loader.print('PostgreSQL installed!');

  // Add sudoers entry
  await add_sudoers_entry(bin_directory);

  // Test pg_ctl
  const data_dir = path.join(base_directory, 'data');
  await fs.promises.mkdir(data_dir, { recursive: true });
  await run_pg_ctl_as_joystick('init', '-D', data_dir);
  process.loader.print('PostgreSQL database initialized!');
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

const set_permissions_for_joystick_user = async (bin_directory) => {
  try {
    await execFileAsync('sudo', ['chown', '-R', 'joystick:joystick', bin_directory]);
    await execFileAsync('sudo', ['chmod', '-R', '755', bin_directory]);
    console.log('Permissions set for joystick user');
  } catch (error) {
    console.error('Error setting permissions for joystick user:', error);
    throw error;
  }
};

const add_sudoers_entry = async (bin_directory) => {
  const current_user = os.userInfo().username;
  const sudoers_entry = `${current_user} ALL=(joystick) NOPASSWD: /usr/bin/env PATH=${bin_directory}:$PATH pg_ctl *`;
  const temp_sudoers_file = '/tmp/joystick_sudoers';

  try {
    // Check if the entry already exists
    const { stdout: existing_sudoers } = await execFileAsync('sudo', ['cat', '/etc/sudoers']);
    if (existing_sudoers.includes(sudoers_entry)) {
      console.log('Sudoers entry already exists');
      return;
    }

    // Write the new entry to a temporary file
    await fs.promises.writeFile(temp_sudoers_file, sudoers_entry + '\n');

    // Use visudo to safely check and add the new entry
    try {
      await execFileAsync('sudo', ['visudo', '-cf', temp_sudoers_file]);
      await execFileAsync('sudo', ['sh', '-c', `cat ${temp_sudoers_file} >> /etc/sudoers`]);
      console.log('Sudoers entry added successfully');
    } catch (error) {
      console.error('Error in sudoers syntax:', error);
      throw new Error('Failed to add sudoers entry due to syntax error');
    }
  } catch (error) {
    console.error('Error adding sudoers entry:', error);
    throw error;
  } finally {
    // Clean up the temporary file
    await fs.promises.unlink(temp_sudoers_file).catch(() => {});
  }
};

const run_pg_ctl_as_joystick = async (...args) => {
  try {
    const { stdout, stderr } = await execFileAsync('sudo', ['-u', 'joystick', 'pg_ctl', ...args]);
    console.log('pg_ctl stdout:', stdout);
    if (stderr) console.error('pg_ctl stderr:', stderr);
    return stdout;
  } catch (error) {
    console.error('Error running pg_ctl:', error);
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