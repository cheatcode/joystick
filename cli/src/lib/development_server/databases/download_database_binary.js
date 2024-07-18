import fs from 'fs';
import path from 'path';
import os from 'os';
import https from 'https';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { execFile } from 'child_process';

const streamPipeline = promisify(pipeline);
const execFileAsync = promisify(execFile);

const database_name_map = {
  mongodb: 'MongoDB',
  postgresql: 'PostgreSQL',
  redis: 'Redis',
};

const make_file_executable = async (bin_directory) => {
  const platform = os.platform();
  if (platform !== 'win32') {
    const files = await fs.promises.readdir(bin_directory);
    for (const file of files) {
      await fs.promises.chmod(path.join(bin_directory, file), '755');
    }
  }
};

const extract_and_build = async (database_name_lowercase, file_path, base_directory, bin_directory) => {
  const platform = os.platform();
 
  if (database_name_lowercase === 'redis') {
    if (platform === 'win32') {
      await execFileAsync('powershell', ['Expand-Archive', '-Path', file_path, '-DestinationPath', bin_directory]);
    } else {
      await execFileAsync('tar', ['-xzf', file_path, '-C', base_directory, '--strip-components=1']);
      await fs.promises.unlink(file_path);
     
      const build_directory = path.join(base_directory, 'src');
      await execFileAsync('make', ['-C', build_directory]);
     
      const redis_server_path = path.join(build_directory, 'redis-server');
      const redis_cli_path = path.join(build_directory, 'redis-cli');
     
      await fs.promises.copyFile(redis_server_path, path.join(bin_directory, 'redis-server'));
      await fs.promises.copyFile(redis_cli_path, path.join(bin_directory, 'redis-cli'));
    }
  } else if (database_name_lowercase === 'postgresql' && platform === 'linux') {
    await execFileAsync('tar', ['-xzf', file_path, '-C', base_directory, '--strip-components=1']);
    await fs.promises.unlink(file_path);

    const checkDependencies = async () => {
      const requiredPackages = [
        'gcc',
        'make',
        'libicu-dev',
        'libreadline-dev',
        'zlib1g-dev'
      ];

      for (const pkg of requiredPackages) {
        try {
          await execFileAsync('dpkg', ['-s', pkg]);
        } catch (error) {
          console.error(`Required package '${pkg}' is not installed.`);
          console.error('Please install the necessary dependencies. For Ubuntu or Debian, run:');
          console.error(`sudo apt-get update && sudo apt-get install ${requiredPackages.join(' ')}`);
          throw new Error('Missing dependencies');
        }
      }
    };

    try {
      await checkDependencies();

      const build_directory = path.join(base_directory, 'build');
      await fs.promises.mkdir(build_directory, { recursive: true });
      
      // Configure
      await execFileAsync('./configure', ['--prefix=' + bin_directory], { cwd: base_directory });
      
      // Build
      await execFileAsync('make', [], { cwd: base_directory });
      
      // Install
      await execFileAsync('make', ['install'], { cwd: base_directory });

      console.log('PostgreSQL has been successfully built and installed.');
    } catch (error) {
      console.error('Error during PostgreSQL build process:', error);
      throw error;
    }
  } else {
    if (platform === 'win32') {
      const temp_directory = path.join(base_directory, 'temp');
      await execFileAsync('powershell', ['Expand-Archive', '-Path', file_path, '-DestinationPath', temp_directory]);
      const extracted_folder = (await fs.promises.readdir(temp_directory))[0];
      const extracted_path = path.join(temp_directory, extracted_folder);
     
      // Remove existing bin directory if it exists
      if (await fs.promises.access(bin_directory).then(() => true).catch(() => false)) {
        await fs.promises.rm(bin_directory, { recursive: true, force: true });
      }
     
      // Copy the entire contents of the extracted folder to the bin directory
      await fs.promises.cp(extracted_path, bin_directory, { recursive: true });

      // Special handling for MongoDB (mongosh)
      if (database_name_lowercase === 'mongodb') {
        const mongosh_url = await get_download_url('mongodb', null, true);
        const mongosh_file_path = path.join(base_directory, 'mongosh.zip');
        await download_file(mongosh_url, mongosh_file_path);
        
        const mongosh_temp_directory = path.join(base_directory, 'mongosh_temp');
        await execFileAsync('powershell', ['Expand-Archive', '-Path', mongosh_file_path, '-DestinationPath', mongosh_temp_directory]);
        
        const mongosh_extracted_folder = (await fs.promises.readdir(mongosh_temp_directory))[0];
        const mongosh_bin_path = path.join(mongosh_temp_directory, mongosh_extracted_folder, 'bin', 'mongosh.exe');
        
        await fs.promises.copyFile(mongosh_bin_path, path.join(bin_directory, 'bin', 'mongosh.exe'));
        
        // Clean up mongosh temporary files
        await fs.promises.unlink(mongosh_file_path);
        await fs.promises.rm(mongosh_temp_directory, { recursive: true, force: true });

        // Verify that mongosh.exe is present
        if (!await fs.promises.access(path.join(bin_directory, 'bin', 'mongosh.exe')).then(() => true).catch(() => false)) {
          throw new Error('Required file mongosh.exe not found in the extracted MongoDB files.');
        }
      }
     
      // Clean up temporary directory
      await fs.promises.rm(temp_directory, { recursive: true, force: true });
    } else {
      await execFileAsync('tar', ['-xzf', file_path, '-C', bin_directory, '--strip-components=1']);
    }
    await fs.promises.unlink(file_path);
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

const get_cpu_info = async () => {
  if (os.platform() === 'darwin') {
    const { stdout } = await execFileAsync('sysctl', ['-n', 'machdep.cpu.brand_string']);
    return stdout.trim();
  }
  return os.arch();
};

const get_download_url = async (database_name_lowercase, version_path, is_mongosh = false) => {
  if (version_path) {
    const config = await fs.promises.readFile(version_path, 'utf-8');
    return JSON.parse(config)[database_name_lowercase].url;
  }

  const platform = os.platform();
  const cpu_info = await get_cpu_info();

  const default_urls = {
    mongodb: {
      win32: {
        main: 'https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.2.zip',
        mongosh: 'https://downloads.mongodb.com/compass/mongosh-2.0.2-win32-x64.zip'
      },
      darwin: cpu_info.includes('ARM') 
        ? 'https://fastdl.mongodb.org/osx/mongodb-macos-arm64-7.0.2.tgz'
        : 'https://fastdl.mongodb.org/osx/mongodb-macos-x86_64-7.0.2.tgz',
      linux: 'https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-ubuntu2204-7.0.2.tgz',
    },
    redis: {
      win32: 'https://github.com/tporadowski/redis/releases/download/v5.0.14.1/Redis-x64-5.0.14.1.zip',
      darwin: 'https://download.redis.io/releases/redis-7.2.3.tar.gz',
      linux: 'https://download.redis.io/releases/redis-7.2.3.tar.gz',
    },
    postgresql: {
      win32: 'https://get.enterprisedb.com/postgresql/postgresql-16.0-1-windows-x64-binaries.zip',
      darwin: 'https://get.enterprisedb.com/postgresql/postgresql-16.0-1-osx-binaries.zip',
      linux: 'https://ftp.postgresql.org/pub/source/v16.0/postgresql-16.0.tar.gz',
    },
  };

  if (platform === 'win32' && database_name_lowercase === 'mongodb') {
    return is_mongosh ? default_urls.mongodb.win32.mongosh : default_urls.mongodb.win32.main;
  }

  return default_urls[database_name_lowercase][platform];
};

const create_directories = async (base_directory, bin_directory) => {
  await fs.promises.mkdir(base_directory, { recursive: true });
  await fs.promises.mkdir(bin_directory, { recursive: true });
};

const download_database_binary = async (database_name_lowercase, version_path = null) => {
  const base_directory = path.join(os.homedir(), '.joystick', 'databases', database_name_lowercase);
  const bin_directory = path.join(base_directory, 'bin');

  if (await check_if_file_exists(base_directory)) {
    return;
  }

  await create_directories(base_directory, bin_directory);

  const download_url = await get_download_url(database_name_lowercase, version_path);
  const file_name = path.basename(new URL(download_url).pathname);
  const file_path = path.join(base_directory, file_name);

  if (await check_if_file_exists(file_path)) {
    return;
  }

  process.loader.print(`${database_name_map[database_name_lowercase]} not found. Downloading... (patience is a virtue—this may take a few minutes)`);
  await download_file(download_url, file_path);
  process.loader.print(`Installing ${database_name_map[database_name_lowercase]}... (more patience—a coffee, perhaps?)`);
  await extract_and_build(database_name_lowercase, file_path, base_directory, bin_directory);
  await make_file_executable(bin_directory);
  process.loader.print(`${database_name_map[database_name_lowercase]} installed!`);
};

export default download_database_binary;