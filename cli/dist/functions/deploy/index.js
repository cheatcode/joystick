import fs from "fs";
import os from "os";
import inquirer from "inquirer";
import CLILog from "../../lib/CLILog.js";
import writeDeploymentTokenToDisk from "./writeDeploymentTokenToDisk.js";
import isValidJSONString from "../../lib/isValidJSONString.js";
import prompts from "./prompts.js";
import getDeployment from "./getDeployment.js";
import getMachineFingerprint from "./getMachineFingerprint.js";
import getDeploymentCosts from "./getDeploymentCosts.js";
var deploy_default = async (args = {}, options = {}) => {
  const hasJoystickFolder = fs.existsSync(".joystick");
  if (!hasJoystickFolder) {
    CLILog("This is not a Joystick project. A .joystick folder could not be found.", {
      level: "danger",
      docs: "https://github.com/cheatcode/joystick"
    });
    process.exit(0);
  }
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
  let domain = options?.domain;
  if (!options?.domain) {
    domain = await inquirer.prompt(prompts.domain()).then((answers) => answers?.domain);
  }
  const fingerprint = await getMachineFingerprint();
  const deploymentFromServer = await getDeployment(domain, deploymentToken, fingerprint);
  if (deploymentFromServer?.deployment?.status === "undeployed") {
    const deploymentToExecute = await inquirer.prompt(prompts.initialDeployment(deploymentFromServer?.user, deploymentToken, fingerprint));
    const monthlyTotal = await getDeploymentCosts(deploymentToExecute);
    console.log(monthlyTotal);
    const confirmInitialDeployment = await inquirer.prompt(prompts.confirmInitialDeployment(deploymentToExecute, monthlyTotal?.costs));
    console.log({
      confirmInitialDeployment
    });
  }
};
export {
  deploy_default as default
};
