import esbuild from "esbuild";
import plugins from "./buildPlugins.js";

const configs = {
  node: (inputPath) => ({
    entryPoints: [inputPath],
    bundle: false,
    outfile: `./.joystick/build/${inputPath}`,
    platform: "node",
    format: "esm",
    minify: process.env.NODE_ENV !== "development",
    plugins: [plugins.generateFileDependencyMap],
  }),
  browser: (inputPath) => ({
    target: "es2020",
    entryPoints: [inputPath],
    bundle: true,
    outfile: `./.joystick/build/${inputPath}`,
    platform: "browser",
    format: "esm",
    minify: process.env.NODE_ENV !== "development",
    plugins: [
      plugins.bootstrapLayoutComponent,
      plugins.bootstrapPageComponent,
      plugins.generateFileDependencyMap,
    ],
  }),
};

export default (file = "", platform = "") => {
  const config = configs[platform] && configs[platform](file);

  if (config) {
    return esbuild.build(config).catch((error) => {
      console.log(error);
    });
  }

  return Promise.resolve();
};
