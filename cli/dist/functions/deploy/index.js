import fs from "fs";
import chalk from "chalk";
import CLILog from "../../lib/CLILog.js";
import writeDeploymentTokenToDisk from "./writeDeploymentTokenToDisk.js";
import isValidJSONString from "../../lib/isValidJSONString.js";
var deploy_default = async (args = {}, options = {}) => {
  const hasJoystickFolder = fs.existsSync(".joystick");
  if (!hasJoystickFolder) {
    CLILog("This is not a Joystick project. A .joystick folder could not be found.", {
      level: "danger",
      docs: "https://github.com/cheatcode/joystick"
    });
    process.exit(0);
  }
  const hasDeploymentTokenFile = fs.existsSync(".deploy/token.json");
  if (!hasDeploymentTokenFile && !options.token) {
    CLILog(`In order to deploy, ${chalk.yellowBright("a deployment token must be passed via the -t or --token flag when running joystick deploy, or, via the .deploy/token.json file at the root of your project")} (automatically generated as part of a previous deployment).`, {
      level: "danger",
      docs: "https://cheatcode.co/docs/deploy/deployment-tokens"
    });
    process.exit(0);
  }
  if (options.token) {
    writeDeploymentTokenToDisk(options.token);
  }
  const deploymentTokenFile = hasDeploymentTokenFile ? isValidJSONString(fs.readFileSync(".deploy/token.json")) : null;
  const deploymentToken = deploymentTokenFile?.deploymentToken || options.token;
  console.log({ deploymentTokenFile, deploymentToken });
};
export {
  deploy_default as default
};
