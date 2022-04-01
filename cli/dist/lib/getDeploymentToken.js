import fs from "fs";
import inquirer from "inquirer";
import writeDeploymentTokenToDisk from "./writeDeploymentTokenToDisk.js";
import isValidJSONString from "./isValidJSONString.js";
import CLILog from "./CLILog.js";
var getDeploymentToken_default = async (options = {}) => {
  const hasDeploymentTokenFile = fs.existsSync(".deploy/token.json");
  let promptToken;
  if (!hasDeploymentTokenFile && !options.token) {
    promptToken = await inquirer.prompt(prompts.token()).then((answers) => answers?.token);
  }
  if (options.token || promptToken) {
    writeDeploymentTokenToDisk(options.token || promptToken);
  }
  const deploymentTokenFile = hasDeploymentTokenFile ? isValidJSONString(fs.readFileSync(".deploy/token.json")) : null;
  const deploymentToken = deploymentTokenFile?.deploymentToken || options.token || promptToken;
  if (!deploymentToken) {
    CLILog(`Deployment token not found. This is likely a bug with the CLI and not your fault. Please review the documentation at the URL below and contact business@cheatcode.co if the problem persists.`, {
      level: "danger",
      docs: "https://cheatcode.co/docs/deploy/deployment-tokens"
    });
    process.exit(0);
  }
  return deploymentToken;
};
export {
  getDeploymentToken_default as default
};
