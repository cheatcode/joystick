import chalk from "chalk";
import { OBJECT_REGEX } from "../../lib/regexes.js";
import rainbowRoad from '../../lib/rainbowRoad.js';
import getCodeFrame from "../../lib/getCodeFrame.js";

const removeLocationDataFromStackTrace = (stackTrace = "") => {
  return stackTrace.replace(OBJECT_REGEX, "");
};

const logError = (warning = {}) => {
  const snippetParts = warning?.snippet?.split(`\n`);

  console.log('\n');
  console.log(`${rainbowRoad()}\n`);

  if (warning.file) {
    console.log(chalk.yellowBright(`Build Error in ${warning?.file}:\n`));
  }

  if (snippetParts && snippetParts.length > 0) {
    snippetParts.forEach((line) => {
      if (line.includes(`> ${warning.line} |`)) {
        return console.log(`   ${chalk.red(line)}`);
      }

      return console.log(`   ${chalk.gray(line)}`);
    });
  }

  if (warning?.stack) {
    console.log(chalk.magentaBright("\nStack Trace:\n"));
    console.log(chalk.yellow(`   ${removeLocationDataFromStackTrace(warning?.stack)}\n`));
  }

  process.loader.error(
    "Build error. Fix the error above to continue building your app."
  );
  console.log('\n');
  console.log(`${rainbowRoad()}\n`);
};

const parseWarning = (warning = {}, type = "") => {
  if (type && type === "BUILD_ERROR") {
    return {
      file: warning?.file,
      snippet: warning?.snippet || getCodeFrame(warning.file, {
        line: warning?.line,
        column: warning?.column,
      }),
      stack: warning?.stack,
      line: warning?.line,
      character: warning?.column,
      message: warning?.message,
    };
  }

  return null;
};

export default (warning) => {
  const parsedWarning = parseWarning(warning, "BUILD_ERROR");

  if (parsedWarning) {
    logError(parsedWarning);
  }

  return parsedWarning;
};
