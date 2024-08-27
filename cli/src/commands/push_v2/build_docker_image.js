import { exec, execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';
import tar from 'tar';
import AdmZip from 'adm-zip';
import { promisify } from 'util';
import { pipeline } from 'stream';
import fetch from 'node-fetch';

const streamPipeline = promisify(pipeline);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const joystick_docker_path = path.join(os.homedir(), '.joystick', 'docker');

const get_docker_binary_path = () => {
  return path.join(joystick_docker_path, os.platform() === 'win32' ? 'docker.exe' : 'docker');
};

const check_docker_installation = () => {
  const docker_path = get_docker_binary_path();
  try {
    execSync(`"${docker_path}" --version`, { stdio: 'ignore' });
    return true;
  } catch (error) {
    console.warn('Warning: Docker is not installed or the binary is not accessible.');
    return false;
  }
};

const get_docker_binary = async () => {
  const platform = os.platform();
  const arch = os.arch();
  let url;
  let archive_name;

  if (platform === 'linux' && arch === 'x64') {
    url = 'https://get.docker.com/builds/Linux/x86_64/docker-latest.tgz';
    archive_name = 'docker-latest.tgz';
  } else if (platform === 'darwin' && arch === 'x64') {
    url = 'https://get.docker.com/builds/Darwin/x86_64/docker-latest.tgz';
    archive_name = 'docker-latest.tgz';
  } else if (platform === 'win32' && arch === 'x64') {
    url = 'https://get.docker.com/builds/Windows/x86_64/docker-latest.zip';
    archive_name = 'docker-latest.zip';
  } else {
    throw new Error(`Unsupported platform or architecture: ${platform} ${arch}`);
  }

  fs.mkdirSync(joystick_docker_path, { recursive: true });
  const archive_path = path.join(joystick_docker_path, archive_name);

  try {
    process.loader.print(`Downloading Docker binary from ${url}`);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Unexpected response ${response.statusText}`);
    await streamPipeline(response.body, fs.createWriteStream(archive_path));
    process.loader.print('Download completed');

    if (platform === 'win32') {
      process.loader.print('Extracting ZIP file');
      const zip = new AdmZip(archive_path);
      zip.extractAllTo(joystick_docker_path, true);
    } else {
      process.loader.print('Extracting TAR file');
      await tar.x({
        file: archive_path,
        cwd: joystick_docker_path,
        strip: 1
      });
    }

    fs.unlinkSync(archive_path);

    // Make the docker binary executable on Unix-like systems
    if (platform !== 'win32') {
      fs.chmodSync(get_docker_binary_path(), '755');
    }

    process.loader.print(`Docker binaries downloaded and extracted to ${joystick_docker_path}`);
  } catch (error) {
    process.loader.print(`Error: ${error.message}`);
    if (fs.existsSync(archive_path)) {
      process.loader.print('Cleaning up partial download');
      fs.unlinkSync(archive_path);
    }
    throw new Error(`Failed to download or extract Docker binary: ${error.message}`);
  }
};

const build_docker_image = (
  image_name = '',
  context_path = '',
  {
    apt_deps = [],
    snap_deps = [],
    npm_deps = []
  } = {}
) => {
  return new Promise(async (resolve, reject) => {
    if (!check_docker_installation()) {
      process.loader.print('Push requires Docker to be installed on your machine. Downloading...');
      try {
        await get_docker_binary();
        process.loader.print('Docker installed!');
      } catch (error) {
        reject(new Error(`Failed to download Docker binary: ${error.message}`));
        return;
      }
    }

    process.loader.print('Building Docker image for deployment...');
    
    const docker_path = get_docker_binary_path();
    const dockerfile_path = path.join(__dirname, 'Dockerfile');
    
    if (!fs.existsSync(dockerfile_path)) {
      reject(new Error(`Dockerfile not found at ${dockerfile_path}`));
      return;
    }

    // Prepare build arguments for dependencies
    const build_args = [
      `CUSTOM_APT_DEPS=${apt_deps.join(' ')}`,
      `CUSTOM_SNAP_DEPS=${snap_deps.join(' ')}`,
      `GLOBAL_NPM_PACKAGES=${npm_deps.join(' ')}`
    ].map(arg => `--build-arg ${arg}`).join(' ');

    const command = `"${docker_path}" build ${build_args} -t ${image_name} -f "${dockerfile_path}" "${context_path || __dirname}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error building Docker image: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`Docker build stderr: ${stderr}`);
      }
      process.loader.print(stdout);
      process.loader.print(`Successfully built Docker image: ${image_name}`);
      resolve();
    });
  });
};

export default build_docker_image;