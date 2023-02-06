import chalk from "chalk";

export default (message = '', color = 'blueBright') => {
  return console.log(chalk[color](message));
};