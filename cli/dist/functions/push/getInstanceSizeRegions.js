import fetch from "node-fetch";
import chalk from "chalk";
import domains from "./domains.js";
import CLILog from "../../lib/CLILog.js";
import checkIfValidJSON from "../../lib/checkIfValidJSON.js";
var getInstanceSizeRegions_default = (target = "", answers = {}, loginSessionToken = "") => {
  const url = new URL(`${domains.provision}/api/providers/${answers?.provider}/regions`);
  const params = new URLSearchParams({
    size: answers[target],
    loadBalancerRegion: answers?.loadBalancer_region
  });
  url.search = params.toString();
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
        data.error?.message,
        {
          level: "danger",
          docs: "https://cheatcode.co/docs/push/deployment-tokens"
        }
      );
      process.exit(0);
    }
    return data?.data;
  });
};
export {
  getInstanceSizeRegions_default as default
};
