import chalk from "chalk";

const color_log = (message = '', color = 'blueBright') => {
  return console.log(chalk[color](message));
};

export default color_log;
