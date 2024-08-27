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

// ... (previous functions remain the same)

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