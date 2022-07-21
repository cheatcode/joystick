import fetch from 'node-fetch';
import chalk from 'chalk';
import domains from "../../lib/domains.js";
import CLILog from "../../lib/CLILog.js";
import checkIfValidJSON from '../../lib/checkIfValidJSON.js';

export default (answers = {}, joystickDeployToken = '', machineFingerprint = {}) => {
  return fetch(
    `${domains.deploy}/api/providers/${answers?.provider}/sizes`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-joystick-deploy-token': joystickDeployToken,
        'x-joystick-deploy-machine-fingerprint': JSON.stringify(machineFingerprint),
      },
    }
  ).then(async (response) => {
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

    return data?.data;
  });
};