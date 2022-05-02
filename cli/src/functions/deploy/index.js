import fs from 'fs';
import os from 'os';
import inquirer from 'inquirer';
import chalk from 'chalk';
import CLILog from '../../lib/CLILog.js';
import writeDeploymentTokenToDisk from '../../lib/writeDeploymentTokenToDisk.js';
import isValidJSONString from '../../lib/isValidJSONString.js';
import prompts from './prompts.js';
import getDeployment from '../../lib/getDeployment.js';
import getMachineFingerprint from '../../lib/getMachineFingerprint.js';
import getDeploymentSummary from './getDeploymentSummary.js';
import providerMap from './providerMap.js';
import Loader from '../../lib/loader.js';
import initDeployment from './initDeployment.js';
import updateDeployment from './updateDeployment.js';
import getDeploymentToken from '../../lib/getDeploymentToken.js';

const handleInitialDeployment = async ({
  deploymentFromServer = {},
  deploymentToken = '',
  fingerprint = {},
  domain = '',
}) => {
  try {
    const loader = new Loader({ padding: ' ', defaultMessage: "" });
    const deploymentToExecute = await inquirer.prompt(
      prompts.initialDeployment(deploymentFromServer?.user, deploymentToken, fingerprint
    ));

    const deploymentToExecuteWithDefaults = {
      ...deploymentToExecute,
      loadBalancerInstances: deploymentToExecute?.loadBalancerInstances || 1,
      appInstances: deploymentToExecute?.appInstances || 2,
    };

    console.log("\n");
    loader.text("Building deployment summary...");

    const deploymentSummary = await getDeploymentSummary(deploymentToExecuteWithDefaults, deploymentToken, fingerprint);

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
        deploymentToken,
        deployment: {
          deploymentId: deploymentFromServer?.deployment?._id,
          domain,
          ...deploymentToExecuteWithDefaults
        },
        fingerprint,
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
    
    const deploymentToken = await getDeploymentToken(options);
  
    let domain = options?.domain;
  
    if (!options?.domain) {
      domain = await inquirer.prompt(prompts.domain()).then((answers) => answers?.domain);
    }
  
    const fingerprint = await getMachineFingerprint();
    const deploymentFromServer = await getDeployment(domain, deploymentToken, fingerprint);
    const isInitialDeployment = deploymentFromServer?.deployment?.status === 'undeployed';

    if (isInitialDeployment) {
      await handleInitialDeployment({
        deploymentFromServer,
        deploymentToken,
        fingerprint,
        domain,
      });

      return;
    }

    await updateDeployment({
      deploymentToken,
      deployment: {
        ...(deploymentFromServer?.deployment || {}),
        deploymentId: deploymentFromServer?.deployment?._id,
      },
      fingerprint,
    });
  } catch (exception) {
    throw new Error(`[deploy] ${exception.message}`);
  }
};
