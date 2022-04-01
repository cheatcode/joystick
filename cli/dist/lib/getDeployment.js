import fetch from "node-fetch";
import chalk from "chalk";
import domains from "./domains.js";
import checkIfValidJSON from "./checkIfValidJSON.js";
import CLILog from "./CLILog.js";
var getDeployment_default = (deploymentDomain = "", deploymentToken = "", fingerprint = {}) => {
  return fetch(`${domains?.deploy}/api/deployments/${deploymentDomain}`, {
    method: "POST",
    headers: {
      "x-deployment-token": deploymentToken,
      "Content-Type": "application/json"
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
  getDeployment_default as default
};
