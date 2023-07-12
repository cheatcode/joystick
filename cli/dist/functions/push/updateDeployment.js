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
import encryptFile from "../../lib/encryptFile.js";
import encryptText from "../../lib/encryptText.js";
let checkDeploymentInterval;
const checkDeploymentStatus = (deploymentId = "", loginSessionToken = "", domain = "") => {
  try {
    return fetch(
      `${domains?.deploy}/api/cli/deployments/${deploymentId}/status`,
      {
        method: "GET",
        headers: {
          "x-login-session-token": loginSessionToken,
          "x-deployment-domain": domain,
          "content-type": "application/json"
        }
      }
    ).then(async (response) => {
      const text = await response.text();
      const data = checkIfValidJSON(text);
      if (data?.error) {
        CLILog(data.error, {
          level: "danger",
          docs: "https://cheatcode.co/docs/push"
        });
        process.exit(0);
      }
      if (data.error) {
        return console.log(chalk.redBright(data.error));
      }
      return data?.data;
    });
  } catch (exception) {
    throw new Error(
      `[updateDeployment.checkDeploymentStatus] ${exception.message}`
    );
  }
};
const getAppSettings = () => {
  try {
    if (fs.existsSync("settings.production.json")) {
      const file = fs.readFileSync("settings.production.json", "utf-8");
      return file;
    }
    return "{}";
  } catch (exception) {
    throw new Error(`[updateDeployment.getAppSettings] ${exception.message}`);
  }
};
const startDeployment = (loginSessionToken = "", deployment = {}, domain = "", deploymentTimestamp = "", appSettings = "") => {
  try {
    return fetch(`${domains?.deploy}/api/cli/deployments`, {
      method: "PUT",
      headers: {
        "x-login-session-token": loginSessionToken,
        "x-deployment-domain": domain,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        ...deployment,
        deploymentTimestamp,
        flags: {
          isInitialDeployment: false
        },
        settings: appSettings
      })
    }).then(async (response) => {
      const text = await response.text();
      const data = checkIfValidJSON(text);
      console.log({ data });
      if (data?.error) {
        CLILog(data.error, {
          level: "danger",
          docs: "https://cheatcode.co/docs/push"
        });
        process.exit(0);
      }
      if (data.error) {
        return console.log(chalk.redBright(data.error));
      }
      return data?.data;
    });
  } catch (exception) {
    throw new Error(`[updateDeployment.startDeployment] ${exception.message}`);
  }
};
const uploadBuildToObjectStorage = (timestamp = "", deploymentOptions = {}, appSettings = "") => {
  try {
    const formData = new FormData();
    formData.append(
      "build_tar",
      fs.readFileSync(`.build/build_enc.tar.xz`),
      `${timestamp}.tar.xz`
    );
    formData.append("flags", JSON.stringify({ isInitialDeployment: false }));
    formData.append("version", timestamp);
    formData.append(
      "deploymentId",
      deploymentOptions?.deployment?.deploymentId
    );
    formData.append(
      "deployment",
      JSON.stringify(deploymentOptions?.deployment || {})
    );
    return fetch(`${domains?.deploy}/api/cli/deployments/upload`, {
      method: "POST",
      headers: {
        ...formData.getHeaders(),
        "x-login-session-token": deploymentOptions?.loginSessionToken,
        "x-deployment-domain": deploymentOptions?.domain
      },
      body: formData
    }).then(async (response) => {
      const data = await response.json();
      return data?.data;
    });
  } catch (exception) {
    throw new Error(
      `[updateDeployment.uploadBuildToObjectStorage] ${exception.message}`
    );
  }
};
const encryptBuild = (deploymentToken = "") => {
  try {
    return encryptFile({
      in: ".build/build.tar.xz",
      out: ".build/build_enc.tar.xz",
      password: deploymentToken
    });
  } catch (exception) {
    throw new Error(`[updateDeployment.encryptBuild] ${exception.message}`);
  }
};
const buildApp = () => {
  try {
    return build({}, { isDeploy: true, type: "tar" });
  } catch (exception) {
    throw new Error(`[updateDeployment.buildApp] ${exception.message}`);
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
    throw new Error(`[updateDeployment.validateOptions] ${exception.message}`);
  }
};
const updateDeployment = async (options, { resolve, reject }) => {
  try {
    validateOptions(options);
    const loader = new Loader({
      padding: "  ",
      defaultMessage: "Deploying app..."
    });
    loader.text("Deploying app...");
    const deploymentTimestamp = (/* @__PURE__ */ new Date()).toISOString();
    await buildApp();
    loader.text("Encrypting build...");
    console.log("DEPLOYMENT", options?.deployment);
    await encryptBuild(options?.deployment?.encryptionToken);
    loader.text("Uploading built app to version control...");
    const appSettings = getAppSettings();
    const encryptedAppSettings = encryptText(
      appSettings || "{}",
      options?.deployment?.encryptionToken
    );
    const uploadReponse = await uploadBuildToObjectStorage(
      deploymentTimestamp,
      options
    );
    if (uploadReponse?.error) {
      loader.stop();
      CLILog(uploadReponse?.error, {
        padding: "  ",
        level: "danger",
        docs: "https://cheatcode.co/docs/push/hosting-providers"
      });
    }
    loader.text("Pushing version to instances...");
    await startDeployment(
      options?.loginSessionToken,
      options.deployment,
      options?.domain,
      deploymentTimestamp,
      encryptedAppSettings
    );
    checkDeploymentInterval = setInterval(async () => {
      const deploymentStatus = await checkDeploymentStatus(
        options?.deployment?.deploymentId,
        options?.loginSessionToken,
        options?.domain
      );
      loader.text(deploymentStatus?.log?.message);
      if (deploymentStatus?.deployment?.status === "deployed") {
        clearInterval(checkDeploymentInterval);
        loader.stop();
        console.log(chalk.green(`  App deployed!
`));
      }
    }, 3e3);
  } catch (exception) {
    console.warn(exception);
    reject(`[updateDeployment] ${exception.message}`);
  }
};
var updateDeployment_default = (options) => new Promise((resolve, reject) => {
  updateDeployment(options, { resolve, reject });
});
export {
  updateDeployment_default as default
};
