import child_process from 'child_process';
import Loader from "../../lib/loader.js";
import getFilesToBuild from "../start/getFilesToBuild.js";
import buildFiles from "../start/buildFiles.js";
import CLILog from "../../lib/CLILog.js";

export default (args = {}, options = {}) => {
  if (!options?.type) {
    CLILog('Must pass a type for your build.', {
      level: 'danger',
      docs: 'https://cheatcode.co/docs/joystick/cli#build',
    });
    process.exit(0);
  }

  if (!options?.outputPath) {
    CLILog('Must pass an output path for your build.', {
      level: 'danger',
      docs: 'https://cheatcode.co/docs/joystick/cli#build',
    });
    process.exit(0);
  }

  console.log("");
  const loader = new Loader({ padding: options?.isDeploy ? '  ' : '', defaultMessage: "Building app..." });
  loader.text("Building app...");

  const filesToBuild = getFilesToBuild();

  // NOTE: Remove any trailing slashes as we force them in the final build output path.
  const lastCharacter = options?.outputPath?.split('')?.pop();
  const sanitizedOutputPath = lastCharacter === '/' ? options?.outputPath?.split('').slice(0, options?.outputPath?.length - 1).join('') : null;

  return buildFiles(filesToBuild, options?.type === 'tar' ? `${sanitizedOutputPath}/.tar` : sanitizedOutputPath).then((response) => {
    if (options?.type === 'tar') {
      child_process.execSync(`tar -cf ${sanitizedOutputPath}/build.tar.xz --use-compress-program='xz -9' --exclude={"${sanitizedOutputPath}/.tar/.deploy","${sanitizedOutputPath}/.tar/.git","${sanitizedOutputPath}/.tar/uploads","${sanitizedOutputPath}/.tar/storage","${sanitizedOutputPath}/.tar/.DS_Store","${sanitizedOutputPath}/.tar/*.tar","${sanitizedOutputPath}/.tar/*.tar.gz","${sanitizedOutputPath}/.tar/*.tar.xz"} ${sanitizedOutputPath}/.tar`);
      child_process.execSync(`cd ${sanitizedOutputPath} && rm -rf .tar`);
    }
  
    loader.pause(`App built as ${options?.type} to ${sanitizedOutputPath}!\n`);
    console.log("");
  }).catch((error) => {
    console.warn(error);
  });
};
