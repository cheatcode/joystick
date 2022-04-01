import fetch from 'node-fetch';
import chalk from 'chalk';
import domains from "../../lib/domains.js";
import CLILog from "../../lib/CLILog.js";
import checkIfValidJSON from '../../lib/checkIfValidJSON.js';

export default (target = '', answers = {}, deploymentToken = '', fingerprint = {}) => {
  const url = new URL(`${domains.deploy}/api/providers/${answers?.provider}/regions`);
  const params = new URLSearchParams({
    size: answers[target],
  });

  url.search = params.toString();

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-deployment-token': deploymentToken,
    },  
    body: JSON.stringify(fingerprint)
  }).then(async (response) => {
    const text = await response.text();
    const data = checkIfValidJSON(text);

    if (data?.error) {
      CLILog(
        data.error,
        {
          level: 'danger',
          docs: 'https://cheatcode.co/docs/deploy/deployment-tokens'
        }
      );
  
      process.exit(0);
    }

    if (data.error) {
      return console.log(chalk.redBright(data.error));
    }

    return data;
  });
};