import chalk from "chalk";
var colorLog_default = (message = "", color = "blueBright") => {
  return console.log(chalk[color](message));
};
export {
  colorLog_default as default
};
