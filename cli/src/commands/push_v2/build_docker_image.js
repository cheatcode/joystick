import { exec, execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const check_docker_installation = () => {
  try {
    execSync('docker --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
};

const build_docker_image = (
  image_name = '',
  context_path = '',
  {
    apt_deps = [],
    npm_deps = []
  } = {}
) => {
  return new Promise((resolve, reject) => {
    if (!check_docker_installation()) {
      process.loader.print("Push requires Docker to deploy your app. Please visit https://docs.docker.com/get-started/get-docker/ to download Docker for your OS.");
      reject(new Error("Docker is not installed or not in the PATH"));
      return;
    }

    process.loader.print('Building Docker image for deployment...');
    
    const dockerfile_path = path.join(__dirname, 'Dockerfile');
    
    if (!fs.existsSync(dockerfile_path)) {
      reject(new Error(`Dockerfile not found at ${dockerfile_path}`));
      return;
    }

    // Ensure context_path is set and contains the .build directory
    if (!context_path || !fs.existsSync(path.join(context_path, '.build'))) {
      reject(new Error('Invalid context path or .build directory not found'));
      return;
    }

    // Prepare build arguments for dependencies
    const build_args = [
      `CUSTOM_APT_DEPS=${apt_deps.join(' ')}`,
      `GLOBAL_NPM_PACKAGES=${npm_deps.join(' ')}`,
      `CACHEBUST=${Date.now()}` // Add timestamp to invalidate cache
    ].map(arg => `--build-arg ${arg}`).join(' ');

    const command = `docker build ${build_args} -t ${image_name} -f "${dockerfile_path}" "${context_path}"`;

    exec(command, { stdio: ['pipe', 'pipe', 'pipe'] }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error building Docker image: ${error.message}`);
        reject(error);
        return;
      }
      
      // Only log stdout if it's not empty
      if (stdout.trim()) {
        process.loader.print(stdout);
      }
      
      // Check if stderr contains actual error messages
      if (stderr.trim() && !stderr.includes("Use 'docker scan' to run Snyk tests against images to find vulnerabilities and learn how to fix them")) {
        console.error(`Docker build stderr: ${stderr}`);
      }
      
      process.loader.print(`Successfully built Docker image: ${image_name}`);
      resolve();
    });
  });
};

export default build_docker_image;