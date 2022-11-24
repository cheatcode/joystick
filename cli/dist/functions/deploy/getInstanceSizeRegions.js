import fetch from "node-fetch";
import chalk from "chalk";
import domains from "../../lib/domains.js";
import CLILog from "../../lib/CLILog.js";
import checkIfValidJSON from "../../lib/checkIfValidJSON.js";
var getInstanceSizeRegions_default = (target = "", answers = {}, loginSessionToken = "") => {
  const url = new URL(`${domains.deploy}/api/providers/${answers?.provider}/regions`);
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
      CLILog(data.error, {
        level: "danger",
        docs: "https://cheatcode.co/docs/deploy/deployment-tokens"
      });
      process.exit(0);
    }
    if (data.error) {
      return console.log(chalk.redBright(data.error));
    }
    return data?.data;
  });
};
export {
  getInstanceSizeRegions_default as default
};
