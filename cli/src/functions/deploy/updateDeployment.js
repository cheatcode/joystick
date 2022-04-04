/* eslint-disable consistent-return */

import fetch from 'node-fetch';
import chalk from 'chalk';
import _ from 'lodash';
import fs from 'fs';
import FormData from 'form-data';
import Loader from '../../lib/loader.js';
import domains from '../../lib/domains.js';
import checkIfValidJSON from '../../lib/checkIfValidJSON.js';
import CLILog from '../../lib/CLILog.js';
import build from '../build/index.js';
import getAppDatabases from './getAppDatabases.js';

let checkDeploymentInterval;

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
    throw new Error(`[updateDeployment.checkDeploymentStatus] ${exception.message}`);
  }
};

const getAppSettings = () => {
  try {
    if (fs.existsSync('settings.production.json')) {
      const file = fs.readFileSync('settings.production.json', 'utf-8');
      return JSON.parse(file);
    }

    return "{}";
  } catch (exception) {
    throw new Error(`[updateDeployment.getAppSettings] ${exception.message}`);
  }
};

const startDeployment = (deploymentToken = '', deployment = {}, fingerprint = {}, deploymentTimestamp = '') => {
  try {
    const appSettings = getAppSettings();

    return fetch(`${domains?.deploy}/api/deployments`, {
      method: 'POST',
      headers: {
        'x-deployment-token': deploymentToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...fingerprint,
        ...deployment,
        deploymentTimestamp,
        flags: {
          isInitialDeployment: false,
        },
        settings: appSettings,
        databases: getAppDatabases(appSettings),

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
    throw new Error(`[updateDeployment.startDeployment] ${exception.message}`);
  }
};

const uploadBuildToObjectStorage = (timestamp = '', deploymentOptions = {}) => {
  try {
    const formData = new FormData();

    formData.append('build_tar', fs.readFileSync(`.build/build.tar.xz`), `${timestamp}.tar.xz`);
    formData.append('flags', JSON.stringify({ isInitialDeployment: false }));
    formData.append('deployment', JSON.stringify(deploymentOptions?.deployment || {}));
    formData.append('fingerprint', JSON.stringify(deploymentOptions?.fingerprint || {}));

    return fetch(`${domains?.deploy}/api/deployments/upload`, {
      method: 'POST',
      headers: {
        ...formData.getHeaders(),
        'x-deployment-token': deploymentOptions?.deploymentToken,
      },
      body: formData,
    }).then(async (response) => {
      const data = await response.json();
      return data;
    });
  } catch (exception) {
    throw new Error(`[updateDeployment.uploadBuildToObjectStorage] ${exception.message}`);
  }
};

const buildApp = () => {
  try {
    return build({}, { isDeploy: true, type: 'tar' });
  } catch (exception) {
    throw new Error(`[updateDeployment.buildApp] ${exception.message}`);
  }
};

const validateOptions = (options) => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.deploymentToken) throw new Error('options.deploymentToken is required.');
    if (!options.deployment) throw new Error('options.deployment is required.');
    if (!options.fingerprint) throw new Error('options.fingerprint is required.');
  } catch (exception) {
    throw new Error(`[updateDeployment.validateOptions] ${exception.message}`);
  }
};

const updateDeployment = async (options, { resolve, reject }) => {
  try {
    validateOptions(options);

    console.log("");
    const loader = new Loader({ padding: '  ', defaultMessage: "Deploying app..." });
    loader.text("Deploying app...");
    
    const deploymentTimestamp = new Date().toISOString();

    await buildApp();
    
    loader.text("Uploading built app to version control...");
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
      options?.deploymentToken,
      options.deployment,
      options.fingerprint,
      deploymentTimestamp,
    );

    checkDeploymentInterval = setInterval(async () => {
      const deploymentStatus = await checkDeploymentStatus(
        options?.deployment?.deploymentId,
        options?.deploymentToken,
        options?.fingerprint
      );

      loader.text(deploymentStatus?.log?.message);

      if (deploymentStatus?.deployment?.status === 'deployed') {
        clearInterval(checkDeploymentInterval);

        loader.stable(`${deploymentStatus?.deployment?.domain} updated!`);
        loader.stop();
        console.log('\n');
      }
    }, 3000);
  } catch (exception) {
    console.warn(exception);
    reject(`[updateDeployment] ${exception.message}`);
  }
};

export default (options) =>
  new Promise((resolve, reject) => {
    updateDeployment(options, { resolve, reject });
  });
