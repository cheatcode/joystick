import fs from "fs";
import inquirer from "inquirer";
import chalk from "chalk";
import CLILog from "../../lib/CLILog.js";
import prompts from "./prompts.js";
import getDeployment from "../../lib/getDeployment.js";
import getDeploymentSummary from "./getDeploymentSummary.js";
import providerMap from "./providerMap.js";
import Loader from "../../lib/loader.js";
import initDeployment from "./initDeployment.js";
import updateDeployment from "./updateDeployment.js";
import getSessionToken from "../../lib/getSessionToken.js";
import getUserFromSessionToken from "./getUserFromSessionToken.js";
import colorLog from "../../lib/colorLog.js";
import checkIfProvisionAvailable from "./checkIfProvisionAvailable.js";
const handleDeployment = async ({
  isInitialDeployment = false,
  loginSessionToken = "",
  domain = "",
  deployment = {},
  user = {},
  environment = "production"
}) => {
  try {
    let confirmation = null;
    let deploymentToExecuteWithDefaults = null;
    if (isInitialDeployment) {
      const loader = new Loader({ padding: " ", defaultMessage: "" });
      const deploymentToExecute = await inquirer.prompt(
        prompts.initialDeployment(
          user,
          loginSessionToken
        )
      );
      deploymentToExecuteWithDefaults = {
        ...deploymentToExecute,
        loadBalancerInstances: deploymentToExecute?.loadBalancerInstances || 1,
        appInstances: deploymentToExecute?.appInstances || 2
      };
      await checkIfProvisionAvailable();
      console.log("\n");
      loader.text("Building deployment summary...");
      const deploymentSummary = await getDeploymentSummary(deploymentToExecuteWithDefaults, loginSessionToken, domain);
      loader.stop();
      const totalInstancesRequested = deploymentToExecuteWithDefaults?.loadBalancerInstances + deploymentToExecuteWithDefaults?.appInstances;
      const deploymentFeasible = totalInstancesRequested <= deploymentSummary?.limits?.available;
      if (!deploymentFeasible) {
        CLILog(`${chalk.yellowBright(`Cannot push with this configuration as it would exceed the limits set by your selected provider (${providerMap[deploymentToExecuteWithDefaults?.provider]}).`)} Your account there is limited to ${deploymentSummary?.limits?.account} instances (currently using ${deploymentSummary?.limits?.existing}).

 You requested ${totalInstancesRequested} instances which would go over your account limit. Please adjust your configuration (or request an increase from your provider) and try again.`, {
          padding: " ",
          level: "danger",
          docs: "https://cheatcode.co/docs/push/provider-limits"
        });
        process.exit(0);
      }
      const response = await inquirer.prompt(
        prompts.confirmInitialDeployment(deploymentToExecuteWithDefaults, deploymentSummary?.costs)
      );
      confirmation = response.confirmation;
    }
    if (!isInitialDeployment || confirmation) {
      await initDeployment({
        environment,
        loginSessionToken,
        isInitialDeployment,
        deployment: {
          environment: deployment?.environment,
          deploymentId: deployment?._id,
          domain,
          ...deploymentToExecuteWithDefaults || {}
        }
      });
      return;
    }
  } catch (exception) {
    throw new Error(`[push.handleDeployment] ${exception.message}`);
  }
};
var push_default = async (args = {}, options = {}) => {
  try {
    const hasJoystickFolder = fs.existsSync(".joystick");
    if (!hasJoystickFolder) {
      CLILog("This is not a Joystick project. A .joystick folder could not be found.", {
        level: "danger",
        docs: "https://github.com/cheatcode/joystick"
      });
      process.exit(0);
    }
    await checkIfProvisionAvailable();
    const loginSessionToken = await getSessionToken();
    await checkIfProvisionAvailable();
    const user = await getUserFromSessionToken(loginSessionToken);
    colorLog(`
\u2714 Logged in as ${user?.emailAddress}
`, "greenBright");
    console.log(user);
    if (!user?.onboardingComplete && user?.onboardingStep < 4) {
      console.log(chalk.yellowBright(`
Please visit push.cheatcode.co to finish setting up your account before deploying.
`));
      process.exit(0);
    }
    let domain = options?.domain;
    if (!domain) {
      domain = await inquirer.prompt(prompts.domain()).then((answers) => answers?.domain);
    }
    await checkIfProvisionAvailable();
    const deploymentFromServer = await getDeployment({ domain, loginSessionToken, environment: options?.environment });
    await handleDeployment({
      isInitialDeployment: deploymentFromServer?.status === "undeployed",
      loginSessionToken,
      domain,
      deployment: deploymentFromServer,
      user,
      environment: options?.environment || "production"
    });
    return true;
  } catch (exception) {
    console.warn(exception);
    throw new Error(`[push] ${exception.message}`);
  }
};
export {
  push_default as default
};
