import fs from "fs";
import chalk from "chalk";
import { codeFrameColumns } from "@babel/code-frame";
import { OBJECT_REGEX } from "../../lib/regexes.js";
const getCodeFrame = (id = "", location = {}) => {
  const file = fs.readFileSync(id, "utf-8");
  const frame = codeFrameColumns(file, { start: location });
  return frame;
};
const removeLocationDataFromStackTrace = (stackTrace = "") => {
  return stackTrace.replace(OBJECT_REGEX, "");
};
const logError = (warning = {}) => {
  const snippetParts = warning?.snippet?.split(`
`);
  if (warning.file) {
    console.log("\n");
    console.log(chalk.yellowBright(`Build Error in ${warning?.file}:
`));
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
    console.log(`   ${removeLocationDataFromStackTrace(warning?.stack)}
`);
  }
  process.loader.error("Build error. Fix the error above to continue building your app.");
  console.log("\n");
};
const parseWarning = (warning = {}, type = "") => {
  if (type && type === "UNRESOLVED_IMPORT") {
    const stack = warning?.stack;
    return {
      file: null,
      snippet: null,
      stack,
      line: null,
      character: null
    };
  }
  if (type && type === "PLUGIN_ERROR") {
    const stack = warning?.stack;
    const locationData = Object.entries(warning).reduce((location, [key, value]) => {
      location[key] = value;
      return location;
    }, {});
    const frame = getCodeFrame(warning.id, {
      line: locationData?.loc?.line,
      column: locationData?.loc?.column
    });
    return {
      file: warning.id,
      snippet: frame,
      stack,
      line: locationData?.loc?.line,
      character: locationData?.loc?.column
    };
  }
  if (type && type === "PARSE_ERROR") {
    const frame = getCodeFrame(warning.id, {
      line: warning?.loc?.line,
      column: warning?.loc?.column
    });
    return {
      file: warning.id,
      snippet: frame,
      stack: warning?.parserError?.stack,
      line: warning?.loc?.line,
      character: warning?.loc?.column
    };
  }
};
var onWarn_default = (warning) => {
  if (warning.code === "UNRESOLVED_IMPORT" && warning?.stack) {
    const parsedWarning = parseWarning(warning, "UNRESOLVED_IMPORT");
    logError(parsedWarning);
    return parsedWarning;
  }
  if (warning.code === "PLUGIN_ERROR" && warning?.stack) {
    const parsedWarning = parseWarning(warning, "PLUGIN_ERROR");
    logError(parsedWarning);
    return parsedWarning;
  }
  if (warning.code === "PARSE_ERROR" && warning?.stack) {
    const parsedWarning = parseWarning(warning, "PARSE_ERROR");
    logError(parsedWarning);
    return parsedWarning;
  }
};
export {
  onWarn_default as default
};
