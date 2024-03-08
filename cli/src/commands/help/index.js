
import chalk from 'chalk';
import { createRequire } from 'module';
import functions from '../index.js';
import rainbow_road from '../../lib/rainbow_road.js';

const require = createRequire(import.meta.url);
const package_json = require('../../../package.json');

const create_spacer = (target = 5, start = '') => {
  const number_of_spaces = target - start.length;
  const spaces = [...(number_of_spaces > 0 ? Array(target - start.length) : '')].map(() => ' ');
  return spaces.join('');
};

const get_args_for_function = (function_args = {}) => {
  return Object.keys(function_args).map((function_arg) => `<${function_arg}>`).join(' ');
};

const build_options_for_function = (function_options = {}) => {
  return Object.entries(function_options).map(([option_name, option_settings]) => {
    return `  ${option_settings.flags && Object.keys(option_settings.flags).map((flag) => chalk.magenta(flag))?.reverse().join(', ')}  ${chalk.gray(option_settings.description)}`;
 }).join('\n');
};

const help = () => {
console.log(`
  ${rainbow_road()}
  
  ${chalk.yellowBright('@joystick.js/cli')} ${chalk.magenta(`(v${package_json.version})`)}
  
  ${chalk.blue('Manage your Joystick app.')}
  
  ${chalk.gray('https://docs.cheatcode.co/joystick/cli')}
  
  ${rainbow_road()}

  ${Object.entries(functions).map(([function_name, function_settings]) => {
    return `
  ${chalk.green(function_name)}  ${chalk.gray(function_settings.description)}\n
  joystick ${function_name} ${chalk.yellow(get_args_for_function(function_settings.args))}
${function_settings.options && Object.keys(function_settings.options).length > 0 ? `
${build_options_for_function(function_settings.options)}
`: ''}`;
}).join('')}`);
};

export default help;
