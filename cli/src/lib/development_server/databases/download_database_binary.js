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
  
  // Remove existing bin directory if it exists
  if (await fs.promises.access(bin_directory).then(() => true).catch(() => false)) {
    await fs.promises.rm(bin_directory, { recursive: true, force: true });
  }
  
  // Create a new empty bin directory
  await fs.promises.mkdir(bin_directory, { recursive: true });

  if (database_name_lowercase === 'redis') {
    if (platform === 'win32') {
      await execFileAsync('powershell', ['Expand-Archive', '-Path', file_path, '-DestinationPath', bin_directory]);
    } else {
      const temp_directory = path.join(base_directory, 'temp');
      await fs.promises.mkdir(temp_directory, { recursive: true });
      await execFileAsync('tar', ['-xzf', file_path, '-C', temp_directory, '--strip-components=1']);
      
      const build_directory = path.join(temp_directory, 'src');
      await execFileAsync('make', ['-C', build_directory]);
      
      const redis_server_path = path.join(build_directory, 'redis-server');
      const redis_cli_path = path.join(build_directory, 'redis-cli');
      
      await fs.promises.copyFile(redis_server_path, path.join(bin_directory, 'redis-server'));
      await fs.promises.copyFile(redis_cli_path, path.join(bin_directory, 'redis-cli'));
      
      // Clean up temp directory
      await fs.promises.rm(temp_directory, { recursive: true, force: true });
    }
  } else {
    const temp_directory = path.join(base_directory, 'temp');
    await fs.promises.mkdir(temp_directory, { recursive: true });

    if (platform === 'win32') {
      await execFileAsync('powershell', ['Expand-Archive', '-Path', file_path, '-DestinationPath', temp_directory]);
      const extracted_folder = (await fs.promises.readdir(temp_directory))[0];
      const extracted_bin_path = path.join(temp_directory, extracted_folder, 'bin');
      
      // Copy contents of extracted bin to final bin directory
      await fs.promises.cp(extracted_bin_path, bin_directory, { recursive: true });
    } else {
      await execFileAsync('tar', ['-xzf', file_path, '-C', temp_directory, '--strip-components=1']);
      const extracted_bin_path = path.join(temp_directory, 'bin');
      
      // Copy contents of extracted bin to final bin directory
      await fs.promises.cp(extracted_bin_path, bin_directory, { recursive: true });
    }

    // Clean up temp directory
    await fs.promises.rm(temp_directory, { recursive: true, force: true });
  }

  // Remove the downloaded archive
  await fs.promises.unlink(file_path);
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

const get_download_url = async (database_name_lowercase, version_path) => {
 if (version_path) {
   const config = await fs.promises.readFile(version_path, 'utf-8');
   return JSON.parse(config)[database_name_lowercase].url;
 }

 const platform = os.platform();
 const cpu_info = await get_cpu_info();

 const default_urls = {
   mongodb: {
     win32: 'https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-6.0.5.zip',
     darwin: cpu_info.includes('ARM') 
       ? 'https://fastdl.mongodb.org/osx/mongodb-macos-arm64-6.0.5.tgz'
       : 'https://fastdl.mongodb.org/osx/mongodb-macos-x86_64-6.0.5.tgz',
     linux: 'https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-ubuntu2004-6.0.5.tgz',
   },
   redis: {
     win32: 'https://github.com/tporadowski/redis/releases/download/v5.0.14.1/Redis-x64-5.0.14.1.zip',
     darwin: 'https://download.redis.io/releases/redis-6.2.6.tar.gz',
     linux: 'https://download.redis.io/releases/redis-6.2.6.tar.gz',
   },
   postgresql: {
     win32: 'https://get.enterprisedb.com/postgresql/postgresql-14.7-1-windows-x64-binaries.zip',
     darwin: 'https://get.enterprisedb.com/postgresql/postgresql-14.7-1-osx-binaries.zip',
     linux: 'https://ftp.postgresql.org/pub/source/v14.7/postgresql-14.7.tar.gz',
   },
 };

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

 process.loader.print(`${database_name_map[database_name_lowercase]} not found. Downloading...`);
 await download_file(download_url, file_path);
 process.loader.print(`Installing ${database_name_map[database_name_lowercase]}...`);
 await extract_and_build(database_name_lowercase, file_path, base_directory, bin_directory);
 await make_file_executable(bin_directory);
 process.loader.print(`${database_name_map[database_name_lowercase]} installed!`);
};

export default download_database_binary;