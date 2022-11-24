import chalk from "chalk";
import { createRequire } from "module";
import functions from "../functions/index.js";
import rainbowRoad from "./rainbowRoad.js";
const require2 = createRequire(import.meta.url);
const packageJSON = require2("../../package.json");
const createSpacer = (target = 5, start = "") => {
  const numberOfSpaces = target - start.length;
  const spaces = [...numberOfSpaces > 0 ? Array(target - start.length) : ""].map(() => " ");
  return spaces.join("");
};
const getArgsForFunction = (functionArgs = {}) => {
  return Object.keys(functionArgs).map((functionArg) => `<${functionArg}>`).join(" ");
};
const buildOptionsForFunction = (functionOptions = {}) => {
  return Object.entries(functionOptions).map(([optionName, optionSettings]) => {
    return `
      ${chalk.green(optionName)}${createSpacer(15, optionName)}${optionSettings.flags && Object.keys(optionSettings.flags).map((flag) => chalk.magenta(flag)).join(", ")}${createSpacer(15, optionName)}${optionSettings.description}
   `;
  }).join("\r");
};
var help_default = () => {
  console.log(`

  ${rainbowRoad()}
  
  ${chalk.yellowBright("@joystick.js/cli")} ${chalk.magenta(`(v${packageJSON.version})`)}
  
  ${chalk.blue("Create, start, build, and update your Joystick app.")}
  
  ${chalk.gray("https://github.com/cheatcode/joystick")}
  
  ${rainbowRoad()}

  
  ${chalk.magenta("Functions:")}

  ${Object.entries(functions).map(([functionName, functionSettings]) => {
    return `
  ${chalk.green(functionName)}${createSpacer(8, functionName)}${chalk.gray(functionSettings.description)}

    ${chalk.yellow("Usage:")}
  
      joystick ${functionName} ${chalk.yellow(getArgsForFunction(functionSettings.args))}

    ${functionSettings.options && Object.keys(functionSettings.options).length > 0 ? `
    ${chalk.yellow("Options:")}
    ${buildOptionsForFunction(functionSettings.options)}
    ` : ""}
    `;
  }).join("")}
  `);
};
export {
  help_default as default
};
