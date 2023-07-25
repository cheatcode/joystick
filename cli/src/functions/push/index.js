import fs from "fs";
import inquirer from "inquirer";
import chalk from "chalk";
import CLILog from "../../lib/CLILog.js";
import prompts from "./prompts.js";
import getDeployment from "../../lib/getDeployment.js";
import getDeploymentSummary from "./getDeploymentSummary.js";
import providerMap from "./providerMap.js";
import Loader from "../../lib/loader.js";
import getSessionToken from "./getSessionToken.js";
import getUserFromSessionToken from "./getUserFromSessionToken.js";
import colorLog from "../../lib/colorLog.js";
import checkIfProvisionAvailable from "./checkIfProvisionAvailable.js     ";
import deploy from './deploy/index.js';

const warnUnfeasibleDeployment = (deploymentToInitialize = {}, deploymentSummary = {}) => {
  try {
    const totalInstancesRequested =
        deploymentToInitialize?.loadBalancerInstances +
        deploymentToInitialize?.appInstances;
    const deploymentFeasible =
        totalInstancesRequested <= deploymentSummary?.limits?.available;

    if (!deploymentFeasible) {
      CLILog(
        `${chalk.yellowBright(
          `Cannot push with this configuration as it would exceed the instance limits set by your selected provider (${
            providerMap[deploymentToInitialize?.provider]
          }).`
          )} Your account there is limited to ${
          deploymentSummary?.limits?.account
        } instances (currently using ${
          deploymentSummary?.limits?.existing
        }).\n\n You requested ${totalInstancesRequested} instances which would go over your account limit. Please adjust your configuration (or request an increase from your provider) and try again.`,
        {
          padding: " ",
          level: "danger",
          docs: "https://cheatcode.co/docs/push/provider-limits",
        }
        );
      process.exit(0);
    }
  } catch (exception) {
    throw new Error(`[actionName.warnUnfeasibleDeployment] ${exception.message}`);
  }
};

const getDeploymentToInitialize = async (user, loginSessionToken) => {
  try {
    const deploymentToInitialize = await inquirer.prompt(
      prompts.initialDeployment(user, loginSessionToken)
    );

    return {
      ...deploymentToInitialize,
      loadBalancerInstances: deploymentToInitialize?.loadBalancerInstances || 1,
      appInstances: deploymentToInitialize?.appInstances || 2,
    };
  } catch (exception) {
    throw new Error(`[actionName.getDeploymentToInitialize] ${exception.message}`);
  }
};

const handleDeployment = async ({
  isInitialDeployment = false,
  loginSessionToken = "",
  domain = "",
  deployment = {},
  user = {},
  environment = "production",
  server = 'production',
}) => {
  try {
    let confirmation = null; // NOTE: Do this here because of the guard below to check if we're running an initial deployment.
    let deploymentToInitialize = null;

    if (isInitialDeployment) {
      const loader = new Loader({ padding: " ", defaultMessage: "" });
      deploymentToInitialize = await getDeploymentToInitialize(user, loginSessionToken);

      await checkIfProvisionAvailable();

      console.log("\n");
      loader.text("Building deployment summary...");

      const deploymentSummary = await getDeploymentSummary(
        deploymentToInitialize,
        loginSessionToken,
        domain
      );

      loader.stop();

      warnUnfeasibleDeployment(deploymentToInitialize, deploymentSummary);

      const response = await inquirer.prompt(
        prompts.confirmInitialDeployment(
          deploymentToInitialize,
          deploymentSummary?.costs
        )
      );

      confirmation = response.confirmation;
    }

    if (!confirmation) {
      process.exit();
    }

    await deploy({
      environment,
      loginSessionToken,
      isInitialDeployment,
      deployment: {
        _id: deployment?._id,
        environment: deployment?.environment,
        domain,
        ...(deploymentToInitialize || {}),
      },
      server,
    });

    return Promise.resolve();
  } catch (exception) {
    throw new Error(`[push.handleDeployment] ${exception.message}`);
  }
};

const getDomain = async (domainFromOptions = '') => {
  try {
    let domain = domainFromOptions;

    if (!domain) {
      domain = await inquirer
        .prompt(prompts.domain())
        .then((answers) => answers?.domain);
    }

    return domain;
  } catch (exception) {
    throw new Error(`[push.getDomain] ${exception.message}`);
  }
};

const onboardingWarning = (user = null) => {
  try {
    if (!user?.onboarding?.complete && user?.onboarding?.step < 4) {
      console.log(
        chalk.yellowBright(
          `\nPlease visit push.cheatcode.co to finish setting up your account before deploying.\n`
        )
      );
      process.exit(0);
    }
  } catch (exception) {
    throw new Error(`[push.onboardingWarning] ${exception.message}`);
  }
};

const noUserWarning = (user = null) => {
  try {
    if (!user) {
      console.log(
        chalk.redBright(
          `\nUser not found. Please try again. If this is a mistake, please contact push@cheatcode.co for assistance.\n`
        )
      );

      process.exit();
    }
  } catch (exception) {
    throw new Error(`[push.noUserWarning] ${exception.message}`);
  }
};

const getUser = async (loginSessionToken = '') => {
  try {
    const user = await getUserFromSessionToken(loginSessionToken);

    if (user) {
      colorLog(`\n✔ Logged in as ${user?.emailAddress}\n`, "greenBright");
    }

    return user;
  } catch (exception) {
    throw new Error(`[push.getUser] ${exception.message}`);
  }
};

const checkForJoystickFolder = () => {
  try {
    const hasJoystickFolder = fs.existsSync(".joystick");

    if (!hasJoystickFolder) {
      CLILog(
        "This is not a Joystick project. A .joystick folder could not be found.",
        {
          level: "danger",
          docs: "https://github.com/cheatcode/joystick",
        }
        );

      process.exit(0);
    }
  } catch (exception) {
    throw new Error(`[push.checkForJoystickFolder] ${exception.message}`);
  }
};

export default async (args = {}, options = {}) => {
  try {
    checkForJoystickFolder();
    await checkIfProvisionAvailable();

    const loginSessionToken = await getSessionToken();
    const user = await getUser(loginSessionToken);

    noUserWarning(user);
    onboardingWarning(user);

    const domain = await getDomain(options?.domain);
    await checkIfProvisionAvailable();

    const deployment = await getDeployment({
      domain,
      loginSessionToken,
      environment: options?.environment,
    });

    await handleDeployment({
      isInitialDeployment: deployment?.status === "undeployed",
      loginSessionToken,
      domain,
      deployment,
      user,
      environment: options?.environment || "production",
      server: options?.server,
    });

    return Promise.resolve();
  } catch (exception) {
    console.warn(exception);
    throw new Error(`[push] ${exception.message}`);
  }
};
