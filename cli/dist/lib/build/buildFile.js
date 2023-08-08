import esbuild from "esbuild";
import fs from "fs";
import onWarn from "./onWarn.js";
import getCodeFrame from "./getCodeFrame.js";
import buildConfigs from "./buildConfigs.js";
const handleBuildException = (exception = {}, file = "") => {
  try {
    console.warn(exception);
    const error = exception?.errors && exception?.errors[0];
    const snippet = fs.existsSync(file) ? getCodeFrame(file, {
      line: error?.location?.line,
      column: error?.location?.column
    }) : null;
    onWarn({
      file,
      stack: exception?.stack,
      line: error?.location?.line,
      column: error?.location?.column,
      snippet,
      lineWithError: error?.location?.lineText?.trim(),
      message: error?.text
    });
    return snippet;
  } catch (exception2) {
    throw new Error(`[buildFile.handleBuildException] ${exception2.message}`);
  }
};
const getConfig = (platform = "", file = "", outputPath = "", environment = "development") => {
  try {
    return buildConfigs[platform] && buildConfigs[platform](file, outputPath, environment);
  } catch (exception) {
    throw new Error(`[buildFile.getConfig] ${exception.message}`);
  }
};
const validateOptions = (options) => {
  try {
    if (!options)
      throw new Error("options object is required.");
    if (!options.platform)
      throw new Error("options.platform is required.");
    if (!options.file)
      throw new Error("options.file is required.");
    if (!options.outputPath)
      throw new Error("options.outputPath is required.");
    if (!options.environment)
      throw new Error("options.environment is required.");
  } catch (exception) {
    throw new Error(`[buildFile.validateOptions] ${exception.message}`);
  }
};
const buildFile = async (options, { resolve, reject }) => {
  try {
    validateOptions(options);
    const config = getConfig(
      options?.platform,
      options?.file,
      options?.outputPath,
      options?.environment
    );
    if (config) {
      esbuild.build(config).then(() => {
        return resolve({ success: true });
      }).catch((exception) => {
        const snippet = handleBuildException(exception, options?.file);
        return resolve({
          success: false,
          path: options?.file,
          error: {
            stack: exception?.stack,
            snippet
          }
        });
      });
    }
  } catch (exception) {
    reject(`[buildFile] ${exception.message}`);
  }
};
var buildFile_default = (options) => new Promise((resolve, reject) => {
  buildFile(options, { resolve, reject });
});
export {
  buildFile_default as default
};
