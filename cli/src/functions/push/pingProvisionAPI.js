import fetch from 'node-fetch';
import chalk from 'chalk';
import domains from "../../lib/domains.js";
import CLILog from "../../lib/CLILog.js";
import checkIfValidJSON from '../../lib/checkIfValidJSON.js';

export default (provider = '', loginSessionToken = '') => {
  const url = new URL(`${domains.provision}/api/cli/ping`);
  return fetch(url, { method: 'GET' }).then(async (response) => {
    const text = await response.text();
    const data = checkIfValidJSON(text);

    console.log('PING', data);

    if (data?.error) {
      CLILog(
        data.error?.message,
        {
          level: 'danger',
          docs: 'https://cheatcode.co/docs/push/deployment-tokens'
        }
      );
  
      process.exit(0);
    }

    return data?.data?.ping;
  }).catch((error) => {
    if (!error?.message?.includes('ECONNREFUSED')) {
      console.warn(error);
    }
  });
};