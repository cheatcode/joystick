import chalk from "chalk";
import rainbowRoad from "./rainbowRoad.js";
var CLILog_default = (message = "", options = {}) => {
  const colors = {
    info: "blue",
    success: "green",
    warning: "yellowBright",
    danger: "red"
  };
  const titles = {
    info: "\u2771 Info",
    success: "\u2771 Ok",
    warning: "\u2771 Warning",
    danger: "\u2771 Error"
  };
  const color = options.level ? colors[options.level] : "gray";
  const title = options.level ? titles[options.level] : "Log";
  const docs = options.docs || "https://github.com/cheatcode/joystick";
  console.log(`
${options.padding || ""}${rainbowRoad()}
`);
  console.log(`${options.padding || ""}${chalk[color](`${title}:`)}
`);
  console.log(`${options.padding || ""}${chalk.white(message)}
`);
  console.log(`${options.padding || ""}${chalk.grey("---")}
`);
  console.log(`${options.padding || ""}${chalk.white("Relevant Documentation:")}
`);
  console.log(`${options.padding || ""}${chalk.blue(docs)}
`);
  console.log(`${options.padding || ""}${chalk.white("Stuck? Ask a Question:")}
`);
  console.log(`${options.padding || ""}${chalk.blue("https://github.com/cheatcode/joystick/discussions")}
`);
  if (options.tools && Array.isArray(options.tools)) {
    console.log(`${options.padding || ""}${chalk.white("Helpful Tools:")}
`);
    options.tools.forEach((tool) => {
      console.log(`${options.padding || ""}${chalk.blue(`${tool.title} \u2014 ${tool.url}`)}
`);
    });
  }
  console.log(`${options.padding || ""}${rainbowRoad()}
`);
};
export {
  CLILog_default as default
};
