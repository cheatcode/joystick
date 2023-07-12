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
import getAvailableCDN from "./getAvailableCDN.js";
const getAppSettings = (environment = "") => {
  try {
    if (fs.existsSync(`settings.${environment}.json`)) {
      const file = fs.readFileSync(`settings.${environment}.json`, "utf-8");
      return file;
    }
    return "{}";
  } catch (exception) {
    throw new Error(`[initDeployment.getAppSettings] ${exception.message}`);
  }
};
const startDeployment = (isInitialDeployment = false, loginSessionToken = "", deployment = {}, deploymentTimestamp = "", appSettings = "", environment = "production") => {
  try {
    const formData = new FormData();
    formData.append("build_tar", fs.readFileSync(`.build/build.tar.xz`), `${deploymentTimestamp}.tar.xz`);
    formData.append("deployment", JSON.stringify({
      ...deployment || {},
      version: deploymentTimestamp,
      settings: appSettings,
      environment
    }));
    return fetch(`${domains?.provision}/api/deployments/${isInitialDeployment ? "initial" : "version"}`, {
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
      const isPayloadSizeError = text?.includes("payload");
      if (data?.error || isPayloadSizeError) {
        CLILog(
          data.error?.message || text,
          {
            level: "danger",
            docs: isPayloadSizeError ? "https://cheatcode.co/docs/push/considerations/payload-size" : "https://cheatcode.co/docs/push"
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
  mirror = "",
  domain = "",
  loginSessionToken = "",
  deploymentId = "",
  version = ""
}) => {
  try {
    const formData = new FormData();
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    formData.append(
      "version_tar",
      fs.readFileSync(`.build/build.tar.xz`),
      `${timestamp}.tar.xz`
    );
    formData.append("deploymentId", deploymentId);
    formData.append("version", version);
    fetch(`${mirror}/api/uploads/receive`, {
      method: "POST",
      headers: {
        ...formData.getHeaders(),
        "x-deployment-domain": domain,
        "x-login-session-token": loginSessionToken
      },
      body: formData
    }).then(async (response) => {
      const data = await response.json();
      return data?.data;
    });
  } catch (exception) {
    throw new Error(`[initDeployment.uploadBuildToCDN] ${exception.message}`);
  }
};
const buildApp = (environment = "production") => {
  try {
    return build({}, { isDeploy: true, type: "tar", environment });
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
    const deploymentTimestamp = (/* @__PURE__ */ new Date()).toISOString();
    await buildApp(options?.deployment?.environment || options?.environment);
    const appSettings = getAppSettings(options?.environment);
    loader.text("Starting deployment...");
    const availableCDN = await getAvailableCDN();
    if (!availableCDN) {
      loader.stop();
      console.log(chalk.redBright(`
Unable to upload version. Check status.cheatcode.co for availability.
`));
      return true;
    }
    c;
    await uploadBuildToCDN({
      mirror: availableCDN,
      domain: options?.deployment?.domain,
      loginSessionToken: options?.loginSessionToken,
      version: deploymentTimestamp,
      deploymentId: options?.deployment?.deploymentId
    });
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
