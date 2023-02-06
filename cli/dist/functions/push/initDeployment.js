import fetch from "node-fetch";
import chalk from "chalk";
import _ from "lodash";
import fs from "fs";
import FormData from "form-data";
import Loader from "../../lib/loader.js";
import domains from "../../lib/domains.js";
import checkIfValidJSON from "../../lib/checkIfValidJSON.js";
import CLILog from "../../lib/CLILog.js";
import build from "../build/index.js";
const getAppSettings = () => {
  try {
    if (fs.existsSync("settings.production.json")) {
      const file = fs.readFileSync("settings.production.json", "utf-8");
      return file;
    }
    return "{}";
  } catch (exception) {
    throw new Error(`[initDeployment.getAppSettings] ${exception.message}`);
  }
};
const startDeployment = (loginSessionToken = "", deployment = {}, deploymentTimestamp = "", appSettings = "") => {
  try {
    const formData = new FormData();
    formData.append("build_tar", fs.readFileSync(`.build/build_enc.tar.xz`), `${deploymentTimestamp}.tar.xz`);
    formData.append("deployment", JSON.stringify({
      ...deployment,
      version: deploymentTimestamp,
      settings: appSettings
    }));
    return fetch(`${domains?.provision}/api/deployments/initial`, {
      method: "POST",
      headers: {
        ...formData.getHeaders(),
        "x-login-session-token": loginSessionToken,
        "x-deployment-domain": deployment?.domain
      },
      body: formData
    }).then(async (response) => {
      const text = await response.text();
      const data = checkIfValidJSON(text);
      if (data?.error) {
        CLILog(data.error?.message, {
          level: "danger",
          docs: "https://cheatcode.co/docs/push"
        });
        process.exit(0);
      }
      return data?.data;
    });
  } catch (exception) {
    throw new Error(`[initDeployment.startDeployment] ${exception.message}`);
  }
};
const buildApp = () => {
  try {
    return build({}, { isDeploy: true, type: "tar" });
  } catch (exception) {
    throw new Error(`[initDeployment.buildApp] ${exception.message}`);
  }
};
const validateOptions = (options) => {
  try {
    if (!options)
      throw new Error("options object is required.");
    if (!options.loginSessionToken)
      throw new Error("options.loginSessionToken is required.");
    if (!options.deployment)
      throw new Error("options.deployment is required.");
  } catch (exception) {
    throw new Error(`[initDeployment.validateOptions] ${exception.message}`);
  }
};
const initDeployment = async (options, { resolve, reject }) => {
  try {
    validateOptions(options);
    console.log("");
    const loader = new Loader({ padding: "  ", defaultMessage: "Deploying app..." });
    loader.text("Deploying app...");
    const deploymentTimestamp = new Date().toISOString();
    await buildApp();
    const appSettings = getAppSettings();
    loader.text("Starting deployment...");
    await startDeployment(options?.loginSessionToken, options.deployment, deploymentTimestamp, appSettings);
    loader.stop();
    console.log(chalk.greenBright(`Your app is deploying! To monitor progress, head to ${domains?.push}/deployments/${options?.deployment?.domain}
`));
    resolve();
  } catch (exception) {
    console.warn(exception);
    reject(`[initDeployment] ${exception.message}`);
  }
};
var initDeployment_default = (options) => new Promise((resolve, reject) => {
  initDeployment(options, { resolve, reject });
});
export {
  initDeployment_default as default
};
