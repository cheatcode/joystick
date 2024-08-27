import chalk from 'chalk';
import commands from './commands/index.js';
import parse_args from './lib/parse_args.js';
import parse_options from './lib/parse_options.js';

const command_names = Object.keys(commands);
const commands_called = process.argv.filter((arg) => command_names.includes(arg));

const show_help = process.argv.some((arg) => ['-h', '--help'].includes(arg));

if (show_help || commands_called.length === 0) {
  commands.help.command();
  process.exit(0);
}

if (commands_called.length > 1) {
  console.log(chalk.red('Only one command can be called at a time.'));
  process.exit(0); 
}

if (commands_called.includes('build')) {
  const args = parse_args(commands.build.args);
  const options = parse_options(commands.build.options);

  if (commands.build.command) {
    commands.build.command(args, options);
  }
}

if (commands_called.includes('create')) {
  const args = parse_args(commands.create.args);
  const options = parse_options(commands.create.options);
    
  if (!args.name) {
    console.log(chalk.red('Must pass a <name> for your app to joystick create. Run joystick --help for examples.'));
    process.exit(0);
  }

  if (commands.create.command) {
    commands.create.command(args, options);
  }
}

if (commands_called.includes('help')) {
  const args = parse_args(commands.help.args);
  const options = parse_options(commands.help.options);

  if (commands.help.command) {
    commands.help.command(args, options);
  }
}

if (commands_called.includes('logout')) {
  const args = parse_args(commands.logout.args);
  const options = parse_options(commands.logout.options);

  if (commands.logout.command) {
    commands.logout.command(args, options);
  }
}

if (commands_called.includes('push')) {
  const args = parse_args(commands.push.args);
  const options = parse_options(commands.push.options);

  if (commands.push.command) {
    commands.push.command(args, options);
  }
}

// NOTE: Temporary. Eventually will replace block above.
if (commands_called.includes('push_v2')) {
  const args = parse_args(commands.push_v2.args);
  const options = parse_options(commands.push_v2.options);

  if (commands.push_v2.command) {
    commands.push_v2.command(args, options);
  }
}

if (commands_called.includes('start')) {
  const args = parse_args(commands.start.args);
  const options = parse_options(commands.start.options);

  if (commands.start.command) {
    commands.start.command(args, options);
  }
}

if (commands_called.includes('test')) {
  const args = parse_args(commands.test.args);
  const options = parse_options(commands.test.options);

  if (commands.test.command) {
    commands.test.command(args, options);
  }
}

if (commands_called.includes('update')) {
  const args = parse_args(commands.update.args);
  const options = parse_options(commands.update.options);

  if (commands.update.command) {
    commands.update.command(args, options);
  }
}

if (commands_called.includes('use')) {
  const args = parse_args(commands.use.args);
  const options = parse_options(commands.use.options);

  if (commands.use.command) {
    commands.use.command(args, options);
  }
}