import fs from "fs";
import os from "os";
import inquirer from "inquirer";
import chalk from "chalk";
import CLILog from "../../lib/CLILog.js";
import writeDeploymentTokenToDisk from "./writeDeploymentTokenToDisk.js";
import isValidJSONString from "../../lib/isValidJSONString.js";
import prompts from "./prompts.js";
import getDeployment from "./getDeployment.js";
import getMachineFingerprint from "./getMachineFingerprint.js";
import getDeploymentSummary from "./getDeploymentSummary.js";
import runDeployment from "./runDeployment.js";
import providerMap from "./providerMap.js";
import Loader from "../../lib/loader.js";
var deploy_default = async (args = {}, options = {}) => {
  try {
    const hasJoystickFolder = fs.existsSync(".joystick");
    const loader = new Loader({ padding: " ", defaultMessage: "" });
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
      console.log("\n");
      loader.text("Building deployment summary...");
      const deploymentSummary = await getDeploymentSummary(deploymentToExecute, deploymentToken, fingerprint);
      loader.stop();
      const totalInstancesRequested = deploymentToExecute?.loadBalancerInstances + deploymentToExecute?.appInstances;
      const deploymentFeasible = totalInstancesRequested <= deploymentSummary?.limits?.available;
      if (!deploymentFeasible) {
        CLILog(`${chalk.yellowBright(`Cannot deploy with this configuration as it would exceed the limits set by your selected provider (${providerMap[deploymentToExecute?.provider]}).`)} Your account there is limited to ${deploymentSummary?.limits?.account} instances (currently using ${deploymentSummary?.limits?.existing}).

 You requested ${totalInstancesRequested} instances which would go over your account limit. Please adjust your configuration (or request an increase from your provider) and try again.`, {
          padding: " ",
          level: "danger",
          docs: "https://cheatcode.co/docs/deploy/provider-limits"
        });
        process.exit(0);
      }
      const { confirmation } = await inquirer.prompt(prompts.confirmInitialDeployment(deploymentToExecute, deploymentSummary?.costs));
      if (confirmation) {
        await runDeployment({
          deploymentToken,
          deployment: {
            deploymentId: deploymentFromServer?.deployment?._id,
            domain,
            ...deploymentToExecute
          },
          fingerprint
        });
      }
    }
  } catch (exception) {
    console.log(exception);
  }
};
export {
  deploy_default as default
};
