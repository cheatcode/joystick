#!/usr/bin/env node --no-warnings

import chalk from 'chalk';
import help from './lib/help.js';
import functions from './functions/index.js';
import getArgs from './lib/getArgs.js';
import getOptions from './lib/getOptions.js';

const functionNames = Object.keys(functions);
const functionsCalled = process.argv.filter((arg) => functionNames.includes(arg));

const showHelp = process.argv.some((arg) => ['-h', '--help'].includes(arg));

if (showHelp || functionsCalled.length === 0) {
  help();
  process.exit(0);
}

if (functionsCalled.length > 1) {
  console.log(chalk.red('Only one function can be called at a time.'));
  process.exit(0); 
}

if (functionsCalled.includes('create')) {
  const args = getArgs(functions.create.args);
  const options = getOptions(functions.create.options);
    
  if (!args.name) {
    console.log(chalk.red('Must pass a <name> for your app to joystick create. Run joystick --help for examples.'));
    process.exit(0);
  }

  if (functions.create.function && typeof functions.create.function === 'function') {
    functions.create.function(args, options);
  }
}

if (functionsCalled.includes('start')) {
  const args = getArgs(functions.start.args);
  const options = getOptions(functions.start.options);

  if (functions.start.function && typeof functions.start.function === 'function') {
    functions.start.function(args, options);
  }
}

if (functionsCalled.includes('build')) {
  const args = getArgs(functions.build.args);
  const options = getOptions(functions.build.options);

  if (functions.build.function && typeof functions.build.function === 'function') {
    functions.build.function(args, options);
  }
}

if (functionsCalled.includes('update')) {
  const args = getArgs(functions.update.args);
  const options = getOptions(functions.update.options);

  if (functions.update.function && typeof functions.update.function === 'function') {
    functions.update.function(args, options);
  }
}

if (functionsCalled.includes('deploy')) {
  const args = getArgs(functions.deploy.args);
  const options = getOptions(functions.deploy.options);

  if (functions.deploy.function && typeof functions.deploy.function === 'function') {
    functions.deploy.function(args, options);
  }
}
