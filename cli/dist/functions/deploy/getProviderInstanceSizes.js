import fetch from "node-fetch";
import chalk from "chalk";
import domains from "./domains.js";
import CLILog from "../../lib/CLILog.js";
import checkIfValidJSON from "./checkIfValidJSON.js";
var getProviderInstanceSizes_default = (answers = {}, deploymentToken = "", fingerprint = {}) => {
  console.log(`${domains.deploy}/api/providers/${answers?.provider}/sizes`);
  return fetch(`${domains.deploy}/api/providers/${answers?.provider}/sizes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-deployment-token": deploymentToken
    },
    body: JSON.stringify(fingerprint)
  }).then(async (response) => {
    const text = await response.text();
    const data = checkIfValidJSON(text);
    if (data?.error) {
      CLILog(data.error, {
        level: "danger",
        docs: "https://cheatcode.co/docs/deploy/deployment-tokens"
      });
      process.exit(0);
    }
    if (data.error) {
      return console.log(chalk.redBright(data.error));
    }
    return data;
  });
};
export {
  getProviderInstanceSizes_default as default
};
