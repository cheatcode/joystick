import esbuild from "esbuild";
import fs from "fs";
import plugins from "./buildPlugins.js";
import onWarn from "./onWarn.js";
import getCodeFrame from "../../lib/getCodeFrame.js";
const configs = {
  node: (inputPath) => ({
    entryPoints: [inputPath],
    bundle: false,
    outfile: `./.joystick/build/${inputPath}`,
    platform: "node",
    format: "esm",
    minify: process.env.NODE_ENV !== "development",
    logLevel: "silent",
    plugins: [plugins.generateFileDependencyMap]
  }),
  browser: (inputPath) => ({
    target: "es2020",
    entryPoints: [inputPath],
    bundle: true,
    outfile: `./.joystick/build/${inputPath}`,
    platform: "browser",
    format: "esm",
    minify: process.env.NODE_ENV !== "development",
    logLevel: "silent",
    plugins: [
      plugins.generateFileDependencyMap,
      plugins.bootstrapLayoutComponent,
      plugins.bootstrapPageComponent,
      plugins.ssrId
    ]
  })
};
var buildFile_default = async (file = "", platform = "") => {
  return new Promise(async (resolve) => {
    const config = configs[platform] && configs[platform](file);
    if (config) {
      try {
        await esbuild.build(config);
        return resolve({
          success: true
        });
      } catch (exception) {
        const error = exception?.errors[0];
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
        return resolve({
          success: false,
          path: file,
          error: {
            stack: exception?.stack,
            snippet
          }
        });
      }
    }
    return resolve({
      success: true
    });
  });
};
export {
  buildFile_default as default
};
