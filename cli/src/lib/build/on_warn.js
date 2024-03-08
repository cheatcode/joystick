import chalk from "chalk";
import constants from "../constants.js";
import get_code_frame from "./get_code_frame.js";
import rainbow_road from '../rainbow_road.js';

const remove_location_data_from_stack_tree = (stack_trace = "") => {
  return stack_trace.replace(constants.OBJECT_REGEX, "");
};

const log_error = (warning = {}) => {
  const snippet_lines = warning?.snippet?.split(`\n`);

  console.log('\n');
  console.log(`${rainbow_road()}\n`);

  if (warning.file) {
    console.log(chalk.yellowBright(`Build Error in ${warning?.file}:\n`));
  }

  if (snippet_lines && snippet_lines.length > 0) {
    snippet_lines.forEach((line) => {
      if (line.includes(`> ${warning.line} |`)) {
        return console.log(`   ${chalk.red(line)}`);
      }

      return console.log(`   ${chalk.gray(line)}`);
    });
  }

  if (warning?.stack) {
    console.log(chalk.magentaBright("\nStack Trace:\n"));
    console.log(chalk.yellow(`   ${remove_location_data_from_stack_tree(warning?.stack)}\n`));
  }

  process.loader.error(
    "Build error. Fix the error above to continue building your app."
    );
  console.log('\n');
  console.log(`${rainbow_road()}\n`);
};

const parse_warning = async (warning = {}, type = "") => {
  if (type && type === "BUILD_ERROR") {
    return {
      file: warning?.file,
      snippet: warning?.snippet ? await get_code_frame(warning.file, {
        line: warning?.line,
        column: warning?.column,
      }) : '',
      stack: warning?.stack,
      line: warning?.line,
      character: warning?.column,
      message: warning?.message,
    };
  }

  return null;
};

const on_warn = async (warning) => {
  const parsed_warning = await parse_warning(warning, "BUILD_ERROR");

  if (parsed_warning) {
    log_error(parsed_warning);
  }

  return parsed_warning;
};

export default on_warn;
