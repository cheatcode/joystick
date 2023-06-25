import esbuild from "esbuild";
import svg from "esbuild-plugin-svg";
import fs from "fs";
import plugins from "./buildPlugins.js";
import onWarn from "./onWarn.js";
import getCodeFrame from "../../lib/getCodeFrame.js";

const configs = {
  node: (inputPath, outputPath = null, environment = "development") => ({
    entryPoints: [inputPath],
    bundle: false,
    outfile: `${outputPath || "./.joystick/build"}/${inputPath}`,
    platform: "node",
    format: "esm",
    define: {
      "process.env.NODE_ENV": `'${environment}'`,
    },
    // minify: environment !== "development",
    logLevel: "silent",
    plugins: [plugins.warnNodeEnvironment, plugins.generateFileDependencyMap],
  }),
  browser: (inputPath, outputPath = null, environment = "development") => {
    return {
      target: "es2020",
      entryPoints: [inputPath],
      bundle: true,
      outfile: `${outputPath || "./.joystick/build"}/${inputPath}`,
      platform: "browser",
      format: "esm",
      define: {
        "process.env.NODE_ENV": `'${environment}'`,
      },
      // minify: environment !== "development",
      logLevel: "silent",
      plugins: [
        plugins.warnNodeEnvironment,
        plugins.generateFileDependencyMap,
        plugins.bootstrapComponent,
        svg(),
      ],
    };
  },
};

export default async (
  file = "",
  platform = "",
  outputPath = "",
  environment = "development"
) => {
  return new Promise(async (resolve) => {
    const config =
      configs[platform] && configs[platform](file, outputPath, environment);

    if (config) {
      try {
        await esbuild.build(config);
        return resolve({
          success: true,
        });
      } catch (exception) {
        console.warn(exception);
        const error = exception?.errors && exception?.errors[0];

        const snippet = fs.existsSync(file)
          ? getCodeFrame(file, {
              line: error?.location?.line,
              column: error?.location?.column,
            })
          : null;

        onWarn({
          file,
          stack: exception?.stack,
          line: error?.location?.line,
          column: error?.location?.column,
          snippet,
          lineWithError: error?.location?.lineText?.trim(),
          message: error?.text,
        });

        return resolve({
          success: false,
          path: file,
          error: {
            stack: exception?.stack,
            snippet,
          },
        });
      }
    }

    return resolve({
      success: true,
    });
  });
};
