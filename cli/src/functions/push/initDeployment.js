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
import getAvailableCDN from "./getAvailableCDN.js";

const getAppSettings = (environment = '') => {
  try {
    if (fs.existsSync(`settings.${environment}.json`)) {
      const file = fs.readFileSync(`settings.${environment}.json`, 'utf-8');
      return file;
    }

    return '{}';
  } catch (exception) {
    throw new Error(`[initDeployment.getAppSettings] ${exception.message}`);
  }
};

const startDeployment = (
  isInitialDeployment = false,
  loginSessionToken = '',
  deployment = {},
  deploymentTimestamp = '',
  appSettings = '',
  environment = 'production'
) => {
  try {
    const formData = new FormData();

    formData.append('build_tar', fs.readFileSync(`.build/build.tar.xz`), `${deploymentTimestamp}.tar.xz`);
    formData.append('deployment', JSON.stringify({
      ...(deployment || {}),
      version: deploymentTimestamp,
      settings: appSettings,
      environment,
    }));

    return fetch(`${domains?.provision}/api/deployments/${isInitialDeployment ? 'initial' : 'version'}`, {
      method: 'POST',
      headers: {
        ...formData.getHeaders(),
        'x-login-session-token': loginSessionToken,
        'x-deployment-domain': deployment?.domain,
      },
      body: formData
    }).then(async (response) => {
      const text = await response.text();
      const data = checkIfValidJSON(text);
      const isPayloadSizeError = text?.includes('payload');

      if (data?.error || isPayloadSizeError) {
        CLILog(
          data.error?.message || text,
          {
            level: 'danger',
            docs: isPayloadSizeError ? 'https://cheatcode.co/docs/push/considerations/payload-size' : 'https://cheatcode.co/docs/push'
          }
        );
    
        process.exit(0);
      }
  
      return data?.data;
    });
  } catch (exception) {
    throw new Error(`[initDeployment.startDeployment] ${exception.message}`);
  }
};

const uploadBuildToCDN = ({
  mirror = '',
  domain = '',
  loginSessionToken = '',
  deploymentId = '',
  version = '',
}) => {
  try {
    const formData = new FormData();
    const timestamp = new Date().toISOString();

    formData.append(
      "version_tar",
      fs.readFileSync(`.build/build.tar.xz`),
      `${timestamp}.tar.xz`
    );

    formData.append('deploymentId', deploymentId);
    formData.append('version', version);

    fetch(`${mirror}/api/uploads/receive`, {
      method: "POST",
      headers: {
        ...formData.getHeaders(),
        "x-deployment-domain": domain,
        "x-login-session-token": loginSessionToken,
      },
      body: formData,
    }).then(async (response) => {
      const data = await response.json();
      return data?.data;
    });
  } catch (exception) {
    throw new Error(`[initDeployment.uploadBuildToCDN] ${exception.message}`);
  }
};

const buildApp = (environment = 'production') => {
  try {
    return build({}, { isDeploy: true, type: 'tar', environment });
  } catch (exception) {
    throw new Error(`[initDeployment.buildApp] ${exception.message}`);
  }
};

const validateOptions = (options) => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.loginSessionToken) throw new Error('options.loginSessionToken is required.');
  } catch (exception) {
    throw new Error(`[initDeployment.validateOptions] ${exception.message}`);
  }
};

const initDeployment = async (options, { resolve, reject }) => {
  try {
    validateOptions(options);
    
    console.log("");
    const loader = new Loader({ padding: '  ', defaultMessage: "Deploying app..." });
    loader.text("Deploying app...");
    
    const deploymentTimestamp = new Date().toISOString();

    // NOTE: If we're just doing a version update and not an initial deployment, we want to respect the
    // existing environment for the deployment. Otherwise, fallback to the --environment flag.
    await buildApp(options?.deployment?.environment || options?.environment);

    const appSettings = getAppSettings(options?.environment);

    loader.text("Starting deployment...");
  
    // TODO: Do the upload indepently to the CDN here. Why: because it's
    // extra work to upload it to provision, just for provision to send it
    // to the CDN.

    const availableCDN = await getAvailableCDN();

    if (!availableCDN) {
      loader.stop();
      console.log(chalk.redBright(`\nUnable to upload version. Check status.cheatcode.co for availability.\n`));
      return true;
    }
 c
    // TODO: This doesn't work. The versions server needs access to a database, so we need to give
    // it access to one and make sure it has user data similar to localhost. May be worth writing a
    // localhost sync script to the database so we can still do local deploys.

    await uploadBuildToCDN({
      mirror: availableCDN,
      domain: options?.deployment?.domain,
      loginSessionToken: options?.loginSessionToken,
      version: deploymentTimestamp,
      deploymentId: options?.deployment?.deploymentId,
    });

//    await startDeployment(
//      options?.isInitialDeployment,
//      options?.loginSessionToken,
//      options.deployment,
//      deploymentTimestamp,
//      appSettings,
//      options?.environment,
//    );

    loader.stop();
    console.log(chalk.greenBright(`Your app is deploying! To monitor progress, head to ${domains?.push}/deployments/${options?.deployment?.domain}\n`));

    resolve();
  } catch (exception) {
    console.warn(exception);
    reject(`[initDeployment] ${exception.message}`);
  }
};

export default (options) =>
  new Promise((resolve, reject) => {
    initDeployment(options, { resolve, reject });
  });
