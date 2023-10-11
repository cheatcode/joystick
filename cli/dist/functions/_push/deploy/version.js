import fs from "fs";
import fetch from "node-fetch";
import domains from "./domains.js";
import checkIfValidJSON from "../../../lib/checkIfValidJSON.js";
import CLILog from "../../../lib/CLILog.js";
const pushDeploymentToProvision = ({
  deploymentPayload = null,
  loginSessionToken,
  server = "production"
}) => {
  try {
    return fetch(`${domains?.provision[server][0]}/api/deployments/version`, {
      method: "POST",
      headers: {
        ...deploymentPayload.getHeaders(),
        "x-login-session-token": loginSessionToken
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
    throw new Error(`[versionDeployment.pushDeploymentToProvision] ${exception.message}`);
  }
};
const getDeploymentPayload = ({
  version,
  deployment,
  settings,
  environment
}) => {
  try {
    const formData2 = new FormData();
    formData2.append("deployment", JSON.stringify({
      ...deployment || {},
      version,
      settings,
      environment
    }));
    return formData2;
  } catch (exception) {
    throw new Error(`[versionDeployment.getDeploymentPayload] ${exception.message}`);
  }
};
const validateOptions = (options) => {
  try {
    if (!options)
      throw new Error("options object is required.");
    if (!options.version)
      throw new Error("options.version is required.");
    if (!options.deployment)
      throw new Error("options.deployment is required.");
    if (!options.settings)
      throw new Error("options.settings is required.");
    if (!options.environment)
      throw new Error("options.environment is required.");
    if (!options.loginSessionToken)
      throw new Error("options.loginSessionToken is required.");
  } catch (exception) {
    throw new Error(`[versionDeployment.validateOptions] ${exception.message}`);
  }
};
const versionDeployment = async (options, { resolve, reject }) => {
  try {
    validateOptions(options);
    const deploymentPayload = getDeploymentPayload({
      version: options?.version,
      deployment: options?.deployment,
      settings: options?.settings,
      environment: options?.environment
    });
    await pushDeploymentToProvision({
      deploymentPayload,
      loginSessionToken: options?.loginSessionToken,
      server: options?.server
    });
    resolve();
  } catch (exception) {
    reject(`[versionDeployment] ${exception.message}`);
  }
};
var version_default = (options) => new Promise((resolve, reject) => {
  versionDeployment(options, { resolve, reject });
});
export {
  version_default as default
};
