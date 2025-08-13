import fs from 'fs';
import chalk from 'chalk';
import child_process from 'child_process';
import util from 'util';
import cli_log from '../../lib/cli_log.js';
import Loader from "../../lib/loader.js";
import replace_in_files from '../../lib/replace_in_files.js';

const { rm } = fs.promises;
const exec = util.promisify(child_process.exec);

const create = async (args = {}, options = {}) => {
  process.loader = new Loader();
  process.loader.print("Creating app...");

  if (options?.release && !['production', 'canary'].includes(options.release)) {
    cli_log('Must pass either production or canary for --release.', {
      level: 'danger',
      docs: 'https://docs.cheatcode.co/joystick/cli/create',
    });
    process.exit(0);
  }

  try {
    // Clone the template repository
    await exec(`git clone https://github.com/cheatcode/joystick-default-template.git ${args.name}`);
    
    // Remove the .git directory to disconnect from the template repo
    await rm(`./${args.name}/.git`, { recursive: true, force: true });

    if (options?.release === 'canary') {
      await replace_in_files(`${process.cwd()}/${args?.name}`, {
        match: [/\.js$/],
        exclude: [/node_modules/],
        replace_regex: /(@joystick.js\/node)(?!-)/g,
        replace_with: '@joystick.js/node-canary',
      });

      await replace_in_files(`${process.cwd()}/${args?.name}`, {
        match: [/\.js$/],
        exclude: [/node_modules/],
        replace_regex: /(@joystick.js\/ui)(?!-)/g,
        replace_with: '@joystick.js/ui-canary',
      });
    }

    // NOTE: Pure aesthetics. Above step completes so quickly that it almost looks like
    // it's skipped. Add a buffer of 1s here to make for a better dev experience.
    setTimeout(async () => {
      process.loader.print("Installing dependencies...");
      await exec(`cd ./${args?.name} && npm install --save @joystick.js/ui${options?.release === 'canary' ? '-canary' : ''}@latest @joystick.js/node${options?.release === 'canary' ? '-canary' : ''}@latest @joystick.js/test${options?.release === 'canary' ? '-canary' : ''}@latest`);
      console.log(
        `${chalk.green("Project created! To get started, run:")}\ncd ${args?.name} && joystick${options?.release === 'canary' ? '-canary' : ''} start`
      );
    }, 1000);
  } catch (error) {
    cli_log(`Failed to create project: ${error.message}`, {
      level: 'danger',
    });
    process.exit(1);
  }
};

export default create;
