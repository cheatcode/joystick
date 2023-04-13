import fetch from "node-fetch";
import chalk from "chalk";
import domains from "./domains.js";
import checkIfValidJSON from "./checkIfValidJSON.js";
import CLILog from "./CLILog.js";

export default ({
  domain = '',
  environment = 'production',
  loginSessionToken = '',
}) => {
  return fetch(
    `${domains?.provision}/api/deployments`,
    {
      method: 'POST',
      headers: {
        'x-login-session-token': loginSessionToken,
        'x-deployment-domain': domain,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        domain,
        environment,
      })
    },
  ).then(async (response) => {
    const text = await response.text();
    console.log(text);
    const data = checkIfValidJSON(text);

    if (data?.error) {
      CLILog(
        data?.error?.message,
        {
          level: 'danger',
          docs: 'https://cheatcode.co/docs/push'
        }
      );
  
      process.exit(0);
    }

    return data?.data?.deployment;
  });
};