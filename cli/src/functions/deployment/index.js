import inquirer from 'inquirer';
import CLILog from "../../lib/CLILog.js";
import getDeployment from '../../lib/getDeployment.js';
import getDeploymentToken from '../../lib/getDeploymentToken.js';
import getMachineFingerprint from '../../lib/getMachineFingerprint.js';
import deploymentSummary from "./deploymentSummary.js";
import prompts from './prompts.js';

export default async (args = {}, options = {}) => {
  if (!options?.domain) {
    return CLILog('Must pass a domain name you want to view or manage.', {
      level: 'danger',
      docs: 'https://cheatcode.co/docs/deploy/managing-deployments',
    });
  }

  const deploymentToken = await getDeploymentToken(options);

  console.log({ deploymentToken });

  const fingerprint = await getMachineFingerprint();
  const deploymentFromServer = await getDeployment(options?.domain, deploymentToken, fingerprint);
  
  if (!args.action) {
    return deploymentSummary(options?.domain, deploymentToken);
  }

  if (args.action === 'scale') {
    const scaleOrder = await inquirer.prompt(prompts.scale(options?.domain, deploymentFromServer?.user));
    console.log(scaleOrder);
  }
};