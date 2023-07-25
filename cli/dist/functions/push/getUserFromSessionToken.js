import fetch from "node-fetch";
import chalk from "chalk";
import domains from "./domains.js";
import CLILog from "../../lib/CLILog.js";
import checkIfValidJSON from "../../lib/checkIfValidJSON.js";
var getUserFromSessionToken_default = (loginSessionToken = "") => {
  return fetch(
    `${domains.provision}/api/cli/user`,
    {
      method: "GET",
      headers: {
        "x-login-session-token": loginSessionToken,
        "Content-Type": "application/json"
      }
    }
  ).then(async (response) => {
    const text = await response.text();
    const data = checkIfValidJSON(text);
    if (data?.error) {
      CLILog(
        data.error,
        {
          level: "danger",
          docs: "https://cheatcode.co/docs/push/deployment-tokens"
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
export {
  getUserFromSessionToken_default as default
};
