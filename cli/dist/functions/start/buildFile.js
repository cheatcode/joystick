import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
import onwarn from "./onWarn.js";
import bootstrapPageComponent from "./bootstrapPageComponent.js";
import bootstrapLayoutComponent from "./bootstrapLayoutComponent.js";
import fileDependencyMapper from "./fileDependencyMapper";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getRollup = () => {
  const rollupPath = `${__dirname.replace(
    "/dist",
    "/node_modules/rollup/dist/rollup.js"
  )}`;
  const rollup = require(rollupPath);
  return rollup;
};

const getPlugins = (format = "umd") => {
  // NOTE: We get plugins this way so that they resolve relative to the CLI install
  // and not the joystick project running the build.
  const modulesPath = `${__dirname.replace("/dist", "/node_modules")}`;

  // TODO: Add terser based on env.
  // import { terser } from "rollup-plugin-terser";

  // NOTE: Resolve uses an ES export and does not offer a function as its main export.
  // This value is stored in the default property on the object returned by the require below.
  const plugins = {
    resolve: require(`${modulesPath}/@rollup/plugin-node-resolve`).default,
    commonjs: require(`${modulesPath}/@rollup/plugin-commonjs`),
    json: require(`${modulesPath}/@rollup/plugin-json`),
    terser: require(`${modulesPath}/rollup-plugin-terser`).terser,
  };

  return plugins;
};

const rollup = getRollup();
const plugins = getPlugins();

export default (path = "", format = "umd") => {
  const pluginsForFormat = {
    cjs: [
      plugins.json(),
      fileDependencyMapper(),
      plugins.commonjs({ ignoreDynamicRequires: true }),
      plugins.resolve({ preferBuiltins: true }),
      ...(process.env.NODE_ENV !== "development" ? [plugins.terser()] : []),
    ],
    umd: [
      plugins.json(),
      bootstrapPageComponent(),
      bootstrapLayoutComponent(),
      fileDependencyMapper(),
      plugins.resolve(),
      plugins.commonjs({ ignoreDynamicRequires: true }),
      ...(process.env.NODE_ENV !== "development" ? [plugins.terser()] : []),
    ],
  };

  return rollup
    .rollup({
      external: [
        // databases
        "mongodb",
        // accounts
        "crypto-extra",
        "dayjs",
        "bcrypt",
        "chalk",
        "nodemailer",
        "html-to-text",
        "juice",
      ],
      input: path,
      onwarn,
      plugins: pluginsForFormat[format],
    })
    .then(async (bundle) => {
      if (bundle) {
        const outputPath = `.joystick/build/${path.replace("./", "")}`;

        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
        }

        await bundle.write({
          exports: "auto",
          file: `.joystick/build/${path.replace("./", "")}`,
          name: path,
          format,
        });

        await bundle.close();

        return {
          success: true,
          path,
        };
      }

      return {
        success: false,
        path,
      };
    })
    .catch((error) => {
      const parsedError = onwarn(error);

      return {
        success: false,
        path,
        error: parsedError,
      };
    });
};
