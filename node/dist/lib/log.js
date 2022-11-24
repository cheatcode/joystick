import chalk from "chalk";
import rainbowRoad from "./rainbowRoad.js";
var log_default = (message = "", options = {}) => {
  if (process.env.NODE_ENV === "test") {
    return;
  }
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
${rainbowRoad()}
`);
  console.log(`${chalk[color](`${title}:`)}
`);
  console.log(`${chalk.white(message)}
`);
  console.log(`${chalk.grey("---")}
`);
  console.log(`${chalk.white("Relevant Documentation:")}`);
  console.log(`
${chalk.blue(docs)}
`);
  console.log(`${chalk.white("Stuck? Ask a Question:")}
`);
  console.log(`${chalk.blue("https://github.com/cheatcode/joystick/discussions")}
`);
  if (options.tools && Array.isArray(options.tools)) {
    console.log(`${chalk.white("Helpful Tools:")}
`);
    options.tools.forEach((tool) => {
      console.log(`${chalk.blue(`${tool.title} \u2014 ${tool.url}`)}
`);
    });
  }
  console.log(`${rainbowRoad()}
`);
};
export {
  log_default as default
};
