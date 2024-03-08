import chalk from 'chalk';
import child_process from "child_process";
import util from 'util';
import color_log from "../../lib/color_log.js";
import Loader from "../../lib/loader.js";

const exec = util.promisify(child_process.exec);

const update = async (args = {}, options = {}) => {
	process.loader = new Loader();
  process.loader.print('Updating Joystick dependencies...');

  process.loader.print(`Updating @joystick.js/node${options?.relase === 'canary' ? '-canary' : ''}...`);
  await exec(`npm i @joystick.js/node${options?.relase === 'canary' ? '-canary' : ''}@latest`);

  process.loader.print(`Updating @joystick.js/test${options?.relase === 'canary' ? '-canary' : ''}...`);
  await exec(`npm i @joystick.js/test${options?.relase === 'canary' ? '-canary' : ''}@latest`);

  process.loader.print(`Updating @joystick.js/ui${options?.relase === 'canary' ? '-canary' : ''}...`);
  await exec(`npm i @joystick.js/ui${options?.relase === 'canary' ? '-canary' : ''}@latest`);
	
	process.loader.print(`Updating @joystick.js/cli${options?.relase === 'canary' ? '-canary' : ''}...`);
	await exec(`npm i -g @joystick.js/cli${options?.relase === 'canary' ? '-canary' : ''}@latest`);

  color_log('✔ Joystick updated!', 'green');
  process.exit(0);
};

export default update;
