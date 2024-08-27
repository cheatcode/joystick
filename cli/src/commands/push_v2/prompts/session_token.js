import chalk from 'chalk';

const session_token = () => [{
  name: 'session_token',
  type: 'text',
  prefix: '',
  message: `\n${chalk.yellowBright('>')} To login to Push, paste your session token below:\n`,
  suffix: `  ${chalk.yellowBright('Find your session token here:')} https://push.cheatcode.co/account/profile\n\n`,
}];

export default session_token;
