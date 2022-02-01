import fetch from "node-fetch";
import chalk from "chalk";
import domains from "./domains.js";
import getLoginCookie from "./getLoginCookie.js";
import checkIfValidJSON from "./checkIfValidJSON.js";
var getDeployment_default = (deploymentDomain = "", cookies = {}) => {
  return fetch(`${domains?.deploy}/api/deployments/${deploymentDomain}`, {
    headers: {
      cookie: getLoginCookie(cookies?.joystickLoginToken, cookies?.joystickLoginTokenExpiresAt)
    }
  }).then(async (response) => {
    const text = await response.text();
    const data = checkIfValidJSON(text);
    if (Object.keys(data).length === 0) {
      console.log(chalk.redBright("Login failed. Please try again."));
      process.exit(0);
    }
    if (data.error) {
      return console.log(chalk.redBright(data.error));
    }
    return data?.deployment;
  });
};
export {
  getDeployment_default as default
};
