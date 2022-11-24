/* eslint-disable consistent-return */

import fetch from 'node-fetch';
import chalk from 'chalk';
import child_process from 'child_process';
import _ from 'lodash';
import fs from 'fs';
import FormData from 'form-data';
import Loader from '../../lib/loader.js';
import domains from '../../lib/domains.js';
import checkIfValidJSON from '../../lib/checkIfValidJSON.js';
import CLILog from '../../lib/CLILog.js';
import rainbowRoad from '../../lib/rainbowRoad.js';
import build from '../build/index.js';
import encryptFile from '../../lib/encryptFile.js';
import encryptText from '../../lib/encryptText.js';

let checkDeploymentInterval;

const checkDeploymentStatus = (deploymentId = '', loginSessionToken = '', domain = '') => {
  try {
    return fetch(`${domains?.deploy}/api/cli/deployments/${deploymentId}/status`, {
      method: 'GET',
      headers: {
        'x-login-session-token': loginSessionToken,
        'x-deployment-domain': domain,
        'content-type': 'application/json',
      },
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
  
      return data?.data;
    });
  } catch (exception) {
    throw new Error(`[initDeployment.checkDeploymentStatus] ${exception.message}`);
  }
};

const getAppSettings = () => {
  try {
    if (fs.existsSync('settings.production.json')) {
      const file = fs.readFileSync('settings.production.json', 'utf-8');
      return file;
    }

    return {};
  } catch (exception) {
    throw new Error(`[initDeployment.getAppSettings] ${exception.message}`);
  }
};

const startDeployment = (
  loginSessionToken = '',
  deployment = {},
  deploymentTimestamp = '',
  appSettings = '',
) => {
  try {
    return fetch(`${domains?.deploy}/api/cli/deployments`, {
      method: 'POST',
      headers: {
        'x-login-session-token': loginSessionToken,
        'x-deployment-domain': deployment?.domain,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        ...deployment,
        deploymentTimestamp,
        flags: {
          isInitialDeployment: true,
        },
        settings: appSettings,
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
  
      return data?.data;
    });
  } catch (exception) {
    throw new Error(`[initDeployment.startDeployment] ${exception.message}`);
  }
};

const uploadBuildToObjectStorage = (timestamp = '', deploymentOptions = {}, appSettings = '') => {
  try {
    const formData = new FormData();

    formData.append('build_tar', fs.readFileSync(`.build/build_enc.tar.xz`), `${timestamp}.tar.xz`);
    formData.append('flags', JSON.stringify({ isInitialDeployment: true }));
    formData.append('version', timestamp);
    formData.append('deployment', JSON.stringify(deploymentOptions?.deployment || {}));

    return fetch(`${domains?.deploy}/api/cli/deployments/upload`, {
      method: 'POST',
      headers: {
        ...formData.getHeaders(),
        'x-login-session-token': deploymentOptions?.loginSessionToken,
        'x-deployment-domain': deploymentOptions?.domain,
      },
      body: formData,
    }).then(async (response) => {
      const data = await response.json();
      return data?.data;
    });
  } catch (exception) {
    throw new Error(`[initDeployment.uploadBuildToObjectStorage] ${exception.message}`);
  }
};

const encryptBuild = (deploymentToken = '') => {
  try {
    return encryptFile({
      in: '.build/build.tar.xz',
      out: '.build/build_enc.tar.xz',
      password: deploymentToken,
    });
  } catch (exception) {
    throw new Error(`[initDeployment.encryptBuild] ${exception.message}`);
  }
};

const buildApp = () => {
  try {
    return build({}, { isDeploy: true, type: 'tar' });
  } catch (exception) {
    throw new Error(`[initDeployment.buildApp] ${exception.message}`);
  }
};

const validateOptions = (options) => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.loginSessionToken) throw new Error('options.loginSessionToken is required.');
    if (!options.deployment) throw new Error('options.deployment is required.');
  } catch (exception) {
    throw new Error(`[initDeployment.validateOptions] ${exception.message}`);
  }
};

const initDeployment = async (options, { resolve, reject }) => {
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
    
    const deploymentTimestamp = new Date().toISOString();

    await buildApp();

    loader.text("Encrypting build...");

    await encryptBuild(options?.deployment?.encryptionToken);
    
    loader.text("Uploading built app to version control...");

    const appSettings = getAppSettings();
    const encryptedAppSettings = encryptText(appSettings || '{}', options?.deployment?.encryptionToken);
    const uploadReponse = await uploadBuildToObjectStorage(deploymentTimestamp, options);

    if (uploadReponse?.error) {
      loader.stop();

      CLILog(
        uploadReponse?.error,
        {
          padding: '  ',
          level: 'danger',
          docs: 'https://cheatcode.co/docs/deploy/hosting-providers'
        }
      );
    }

    loader.text("Starting deployment...");
  
    await startDeployment(
      options?.loginSessionToken,
      options.deployment,
      deploymentTimestamp,
      encryptedAppSettings,
    );

    checkDeploymentInterval = setInterval(async () => {
      const deploymentStatus = await checkDeploymentStatus(
        options?.deployment?.deploymentId,
        options?.loginSessionToken,
        options?.deployment?.domain,
      );

      loader.text(deploymentStatus?.log?.message);

      if (deploymentStatus?.deployment?.status === 'bootstrapping') {
        loader.stop();
        clearInterval(checkDeploymentInterval);

        console.log(`  \n  ${rainbowRoad()}\n\n`);
        console.log(`  ${chalk.greenBright('Servers provisioned!')}\n`);
        console.log(`  ${chalk.whiteBright(`We're bootstrapping your servers now (nerd-speak for installing dependencies, tweaking settings, and uploading your app code).`)}\n`);
        console.log(`  ${chalk.yellowBright(`To keep an eye on progress and finish getting your app live, head over to:`)}\n`);
        console.log(`  ${chalk.blueBright(`https://cheatcode.co/u/deployments/${options?.deployment?.domain}/deployment`)}\n\n`);
      }
    }, 3000);
  } catch (exception) {
    console.warn(exception);
    reject(`[initDeployment] ${exception.message}`);
  }
};

export default (options) =>
  new Promise((resolve, reject) => {
    initDeployment(options, { resolve, reject });
  });
