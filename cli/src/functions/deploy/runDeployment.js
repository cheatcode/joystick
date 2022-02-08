/* eslint-disable consistent-return */

import fetch from 'node-fetch';
import chalk from 'chalk';
import AsciiTable from 'ascii-table';
import Loader from '../../lib/loader.js';
import domains from './domains.js';
import checkIfValidJSON from './checkIfValidJSON.js';
import CLILog from '../../lib/CLILog.js';
import rainbowRoad from '../../lib/rainbowRoad.js';

let checkDeploymentInterval;
const sslRecordsTable = new AsciiTable();

const checkDeploymentStatus = (deploymentId = '', deploymentToken = '', fingerprint = {}) => {
  try {
    return fetch(`${domains?.deploy}/api/deployments/status/${deploymentId}`, {
      method: 'POST',
      headers: {
        'x-deployment-token': deploymentToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fingerprint)
    }).then(async (response) => {
      const text = await response.text();
      const data = checkIfValidJSON(text);

      if (data?.error) {
        CLILog(
          data.error,
          {
            level: 'danger',
            docs: 'https://cheatcode.co/docs/deploy'
          }
        );
    
        process.exit(0);
      }
  
      if (data.error) {
        return console.log(chalk.redBright(data.error));
      }
  
      return data;
    });
  } catch (exception) {
    throw new Error(`[actionName.checkDeploymentStatus] ${exception.message}`);
  }
};

const startDeployment = (deploymentToken = '', deployment = {}, fingerprint = {}) => {
  try {
    return fetch(`${domains?.deploy}/api/deployments`, {
      method: 'POST',
      headers: {
        'x-deployment-token': deploymentToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...fingerprint,
        ...deployment,
      })
    }).then(async (response) => {
      const text = await response.text();
      const data = checkIfValidJSON(text);

      if (data?.error) {
        CLILog(
          data.error,
          {
            level: 'danger',
            docs: 'https://cheatcode.co/docs/deploy'
          }
        );
    
        process.exit(0);
      }
  
      if (data.error) {
        return console.log(chalk.redBright(data.error));
      }
  
      return data;
    });
  } catch (exception) {
    throw new Error(`[runDeployment.startDeployment] ${exception.message}`);
  }
};

const validateOptions = (options) => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.deploymentToken) throw new Error('options.deploymentToken is required.');
    if (!options.deployment) throw new Error('options.deployment is required.');
    if (!options.fingerprint) throw new Error('options.fingerprint is required.');
  } catch (exception) {
    throw new Error(`[runDeployment.validateOptions] ${exception.message}`);
  }
};

const runDeployment = async (options, { resolve, reject }) => {
  try {
    validateOptions(options);

    // Only reason it was screwing up was out of sync data in the DB
    // and the existing conditionals to route deployment down another path
    // depending on the status/existing server count. May need to revisit this
    // and consider an easy means for resetting for admins (do a simple admin panel
    // for deploy.cheatcode.co that has a "reset" button).
    
    console.log("");
    const loader = new Loader({ padding: '  ', defaultMessage: "Deploying app..." });
    loader.text("Deploying app...");

    await startDeployment(options?.deploymentToken, options.deployment, options.fingerprint);

    checkDeploymentInterval = setInterval(async () => {
      const deploymentStatus = await checkDeploymentStatus(
        options?.deployment?.deploymentId,
        options?.deploymentToken,
        options?.fingerprint
      );

      loader.text(deploymentStatus?.log?.message);

      if (deploymentStatus?.deployment?.status === 'deployed') {
        const loadBalancerInstances = deploymentStatus?.deployment?.instances?.filter((instance) => instance.type === 'loadBalancer');

        loader.stop();
        clearInterval(checkDeploymentInterval);

        console.log(`  \n  ${rainbowRoad()}\n\n`);
        console.log(chalk.yellowBright(`  ${chalk.magenta('>>>')} Steps below must be completed in order to issue your SSL certificates. ${chalk.magenta('<<<')}\n\n`));
        console.log(chalk.white(`  ${chalk.yellowBright('1.')} Add a DNS record type A to the domain you deployed to for each of the Load Balancer IP addresses in the table below.\n`));

        console.log(`  ${chalk.gray('------')}\n`);
        
        console.log(`${sslRecordsTable
          .removeBorder()
          .setHeading(chalk.magenta('DNS Record Type'), chalk.magenta('Domain'), chalk.magenta('IP Address'), chalk.magenta('TTL'))
          .addRowMatrix(
            loadBalancerInstances.map((loadBalancer) => {
              return [chalk.blueBright('A'), chalk.yellowBright(options?.deployment?.domain), chalk.greenBright(loadBalancer?.instance?.ip), chalk.white('As Low As Possible (1 minute)')]
            })
          )
          .setAlign(0, AsciiTable.CENTER)
          .setAlign(1, AsciiTable.CENTER)
          .setAlign(2, AsciiTable.CENTER)
          .setAlign(3, AsciiTable.CENTER)
          .toString()}\n\n
  ${chalk.yellowBright(`Learn more about creating DNS records here: ${chalk.blueBright('https://cheatcode.co/docs/deploy/dns')}`)}
        `);

        console.log(`  ${chalk.gray('------')}\n`);

        console.log(chalk.white(`  ${chalk.yellowBright('2.')} Visit ${chalk.blueBright(`https://cheatcode.co/u/deployments/${options?.deployment?.domain}`)} and click the "Provision SSL Certificate" button.\n`));
        console.log(chalk.white(`  ${chalk.yellowBright('3.')} If Step #2 fails, wait 5 minutes and try again until your certificate is provisioned.\n`));
        console.log(chalk.white(`  ${chalk.yellowBright('4.')} If SSL fails to provision after multiple attempts, double-check your DNS configuration and try again.\n`));
        console.log('\n');
      }
    }, 3000);

    // TODO: Implement a check for deployment status here (updating the loader).
    // TODO: Once status === 'deployed', exit the loader and display the 
  } catch (exception) {
    reject(`[runDeployment] ${exception.message}`);
  }
};

export default (options) =>
  new Promise((resolve, reject) => {
    runDeployment(options, { resolve, reject });
  });
