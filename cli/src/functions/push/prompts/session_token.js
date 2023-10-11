import chalk from 'chalk';

export default () => [{
  name: 'session_token',
  type: 'text',
  prefix: '',
  message: `\n${chalk.yellowBright('>')} To login to Push, paste your session token below:\n`,
  suffix: `  ${chalk.yellowBright('Find your session token here:')} https://push.cheatcode.co/account/profile\n\n`,
}];

