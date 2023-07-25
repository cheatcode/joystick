import fetch from "node-fetch";
import chalk from "chalk";
import { URL, URLSearchParams } from "url";
import domains from "./domains.js";
import checkIfValidJSON from "./checkIfValidJSON.js";
import CLILog from "./CLILog.js";
var getDeployment_default = ({
  domain = "",
  environment = "production",
  loginSessionToken = ""
}) => {
  const url = new URL(`${domains?.provision}/api/deployments`);
  url.search = new URLSearchParams({
    domain,
    environment
  });
  return fetch(url, {
    method: "GET",
    headers: {
      "x-login-session-token": loginSessionToken,
      "content-type": "application/json"
    }
  }).then(async (response) => {
    const text = await response.text();
    const data = checkIfValidJSON(text);
    if (data?.error) {
      CLILog(
        data?.error?.message,
        {
          level: "danger",
          docs: "https://cheatcode.co/docs/push"
        }
      );
      process.exit(0);
    }
    return data?.data?.deployment;
  });
};
export {
  getDeployment_default as default
};
