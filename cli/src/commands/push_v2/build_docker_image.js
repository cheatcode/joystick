import { exec, execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import fs from 'fs';
import os from 'os';
import tar from 'tar';
import AdmZip from 'adm-zip';

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

const download_file = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (error) => {
      fs.unlink(dest, () => reject(error));
    });
  });
};

const get_docker_binary = async () => {
  const platform = os.platform();
  const arch = os.arch();
  let url;
  let archive_name;

  if (platform === 'linux') {
    url = `https://download.docker.com/linux/static/stable/${arch}/docker-24.0.7.tgz`;
    archive_name = 'docker.tgz';
  } else if (platform === 'darwin') {
    url = `https://download.docker.com/mac/static/stable/${arch}/docker-24.0.7.tgz`;
    archive_name = 'docker.tgz';
  } else if (platform === 'win32') {
    url = 'https://download.docker.com/win/static/stable/x86_64/docker-24.0.7.zip';
    archive_name = 'docker.zip';
  } else {
    throw new Error('Unsupported operating system');
  }

  fs.mkdirSync(joystick_docker_path, { recursive: true });
  const archive_path = path.join(joystick_docker_path, archive_name);
  await download_file(url, archive_path);

  if (platform === 'win32') {
    const zip = new AdmZip(archive_path);
    zip.extractAllTo(joystick_docker_path, true);
  } else {
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