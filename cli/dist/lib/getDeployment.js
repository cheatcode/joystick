import fetch from "node-fetch";
import chalk from "chalk";
import domains from "./domains.js";
import checkIfValidJSON from "./checkIfValidJSON.js";
import CLILog from "./CLILog.js";
var getDeployment_default = (deploymentDomain = "", joystickDeployToken = "", machineFingerprint = {}) => {
  return fetch(`${domains?.deploy}/api/cli/deployments/${deploymentDomain}`, {
    method: "GET",
    headers: {
      "x-joystick-deploy-token": joystickDeployToken,
      "x-joystick-deploy-machine-fingerprint": JSON.stringify(machineFingerprint),
      "content-type": "application/json"
    }
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
    return data?.data;
  });
};
export {
  getDeployment_default as default
};
