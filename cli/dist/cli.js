import chalk from "chalk";
import help from "./lib/help.js";
import functions from "./functions/index.js";
import getArgs from "./lib/getArgs.js";
import getOptions from "./lib/getOptions.js";
const functionNames = Object.keys(functions);
const functionsCalled = process.argv.filter((arg) => functionNames.includes(arg));
const showHelp = process.argv.some((arg) => ["-h", "--help"].includes(arg));
if (showHelp || functionsCalled.length === 0) {
  help();
  process.exit(0);
}
if (functionsCalled.length > 1) {
  console.log(chalk.red("Only one function can be called at a time."));
  process.exit(0);
}
if (functionsCalled.includes("build")) {
  const args = getArgs(functions.build.args);
  const options = getOptions(functions.build.options);
  if (functions.build.function && typeof functions.build.function === "function") {
    functions.build.function(args, options);
  }
}
if (functionsCalled.includes("create")) {
  const args = getArgs(functions.create.args);
  const options = getOptions(functions.create.options);
  if (!args.name) {
    console.log(chalk.red("Must pass a <name> for your app to joystick create. Run joystick --help for examples."));
    process.exit(0);
  }
  if (functions.create.function && typeof functions.create.function === "function") {
    functions.create.function(args, options);
  }
}
if (functionsCalled.includes("logout")) {
  const args = getArgs(functions.logout.args);
  const options = getOptions(functions.logout.options);
  if (functions.logout.function && typeof functions.logout.function === "function") {
    functions.logout.function(args, options);
  }
}
if (functionsCalled.includes("push")) {
  const args = getArgs(functions.push.args);
  const options = getOptions(functions.push.options);
  if (functions.push.function && typeof functions.push.function === "function") {
    functions.push.function(args, options);
  }
}
if (functionsCalled.includes("start")) {
  const args = getArgs(functions.start.args);
  const options = getOptions(functions.start.options);
  if (functions.start.function && typeof functions.start.function === "function") {
    functions.start.function(args, options);
  }
}
if (functionsCalled.includes("test")) {
  const args = getArgs(functions.test.args);
  const options = getOptions(functions.test.options);
  if (functions.test.function && typeof functions.test.function === "function") {
    functions.test.function(args, options);
  }
}
if (functionsCalled.includes("update")) {
  const args = getArgs(functions.update.args);
  const options = getOptions(functions.update.options);
  if (functions.update.function && typeof functions.update.function === "function") {
    functions.update.function(args, options);
  }
}
if (functionsCalled.includes("use")) {
  const args = getArgs(functions.use.args);
  const options = getOptions(functions.use.options);
  if (functions.use.function && typeof functions.use.function === "function") {
    functions.use.function(args, options);
  }
}
