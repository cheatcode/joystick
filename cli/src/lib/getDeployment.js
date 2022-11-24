import fetch from "node-fetch";
import chalk from "chalk";
import domains from "./domains.js";
import checkIfValidJSON from "./checkIfValidJSON.js";
import CLILog from "./CLILog.js";

export default ({
  domain = '',
  loginSessionToken = '',
}) => {
  return fetch(
    `${domains?.deploy}/api/cli/deployments/${domain}`,
    {
      method: 'GET',
      headers: {
        'x-login-session-token': loginSessionToken,
        'x-deployment-domain': domain,
        'content-type': 'application/json',
      },
    },
  ).then(async (response) => {
    const text = await response.text();
    const data = checkIfValidJSON(text);

    if (data?.error) {
      CLILog(
        data?.error?.message || data?.error,
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