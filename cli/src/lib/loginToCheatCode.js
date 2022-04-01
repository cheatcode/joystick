import fetch from 'node-fetch';
import chalk from 'chalk';
import domains from './domains.js';
import checkIfValidJSON from './checkIfValidJSON.js';
import parseCookiesFromLogin from './parseCookiesFromLogin.js';

export default async (emailAddress = '', password = '') => {
  return fetch(`${domains?.site}/api/_accounts/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      emailAddress,
      password,
      output: ['_id', 'emailAddress', 'aws.username', 'digitalOcean.info.email', 'linode.account.email', 'vultr.email']
    }),
  }).then(async (response) => {
    const text = await response.text();
    const data = checkIfValidJSON(text);

    if (Object.keys(data).length === 0) {
      console.log(chalk.redBright('Login failed. Please try again.'));
      process.exit(0);
    }

    const error = data?.errors && data.errors[0]?.message;
  
    if (error) {
      console.log(chalk.redBright(error));
    }
    
    if (!error) {
      const cookies = parseCookiesFromLogin(response);
    
      if (cookies.joystickLoginToken && cookies.joystickLoginTokenExpiresAt) {
        console.log(chalk.greenBright(`\n Logged in as ${data?.emailAddress}!`));

        return {
          user: data,
          cookies,
        };
      }
    }
  }).catch((response) => {
    console.warn(response);
  });
};