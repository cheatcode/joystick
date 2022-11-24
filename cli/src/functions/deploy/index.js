import fs from 'fs';
import inquirer from 'inquirer';
import chalk from 'chalk';
import CLILog from '../../lib/CLILog.js';
import prompts from './prompts.js';
import getDeployment from '../../lib/getDeployment.js';
import getDeploymentSummary from './getDeploymentSummary.js';
import providerMap from './providerMap.js';
import Loader from '../../lib/loader.js';
import initDeployment from './initDeployment.js';
import updateDeployment from './updateDeployment.js';
import getSessionToken from '../../lib/getSessionToken.js';

const handleInitialDeployment = async ({
  deploymentFromServer = {},
  loginSessionToken = '',
  domain = '',
}) => {
  try {
    const loader = new Loader({ padding: ' ', defaultMessage: "" });
    const deploymentToExecute = await inquirer.prompt(
      prompts.initialDeployment(
        deploymentFromServer?.user,
        loginSessionToken,
      )
    );

    const deploymentToExecuteWithDefaults = {
      ...deploymentToExecute,
      loadBalancerInstances: deploymentToExecute?.loadBalancerInstances || 1,
      appInstances: deploymentToExecute?.appInstances || 2,
    };

    console.log("\n");
    loader.text("Building deployment summary...");

    const deploymentSummary = await getDeploymentSummary(deploymentToExecuteWithDefaults, loginSessionToken, domain);

    loader.stop();

    const totalInstancesRequested = deploymentToExecuteWithDefaults?.loadBalancerInstances + deploymentToExecuteWithDefaults?.appInstances;
    const deploymentFeasible = totalInstancesRequested <= deploymentSummary?.limits?.available;

    if (!deploymentFeasible) {
      CLILog(`${chalk.yellowBright(`Cannot deploy with this configuration as it would exceed the limits set by your selected provider (${providerMap[deploymentToExecuteWithDefaults?.provider]}).`)} Your account there is limited to ${deploymentSummary?.limits?.account} instances (currently using ${deploymentSummary?.limits?.existing}).\n\n You requested ${totalInstancesRequested} instances which would go over your account limit. Please adjust your configuration (or request an increase from your provider) and try again.`, {
        padding: ' ',
        level: 'danger',
        docs: 'https://cheatcode.co/docs/deploy/provider-limits',
      });
      process.exit(0);
    }

    const { confirmation } = await inquirer.prompt(
      prompts.confirmInitialDeployment(deploymentToExecuteWithDefaults, deploymentSummary?.costs)
    );

    if (confirmation) {
      await initDeployment({
        loginSessionToken,
        deployment: {
          deploymentId: deploymentFromServer?.deployment?._id,
          encryptionToken: deploymentFromServer?.deployment?.token,
          domain,
          ...deploymentToExecuteWithDefaults
        },
      });

      loader.stable('Deployment complete!');
      loader.stop();

      return;
    }
  } catch (exception) {
    throw new Error(`[deploy.handleInitialDeployment] ${exception.message}`);
  }
};

export default async (args = {}, options = {}) => {
  try {
    const hasJoystickFolder = fs.existsSync('.joystick');

    if (!hasJoystickFolder) {
      CLILog('This is not a Joystick project. A .joystick folder could not be found.', {
        level: 'danger',
        docs: 'https://github.com/cheatcode/joystick',
      });
      
      process.exit(0);
    }

    const loginSessionToken = await getSessionToken();

    let domain = options?.domain;

    if (!options?.domain) {
      domain = await inquirer.prompt(prompts.domain()).then((answers) => answers?.domain);
    }
  
    const deploymentFromServer = await getDeployment({
      domain,
      loginSessionToken,
    });

    const isInitialDeployment = deploymentFromServer?.deployment?.status === 'undeployed';

    if (isInitialDeployment) {
      await handleInitialDeployment({
        deploymentFromServer,
        loginSessionToken,
        domain,
      });

      return;
    }

    await updateDeployment({
      loginSessionToken,
      deployment: {
        ...(deploymentFromServer?.deployment || {}),
        deploymentId: deploymentFromServer?.deployment?._id,
        encryptionToken: deploymentFromServer?.deployment?.token,
      },
    });
  } catch (exception) {
    console.warn(exception);
    throw new Error(`[deploy] ${exception.message}`);
  }
};
