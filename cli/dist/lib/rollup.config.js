const glob = require("glob");
const fs = require("fs");
const resolve = require("@rollup/plugin-node-resolve").default;
const commonjs = require("@rollup/plugin-commonjs");
const json = require("@rollup/plugin-json");
const { terser } = require("rollup-plugin-terser");
const copy = require("rollup-plugin-copy");

const cjsFiles = [...(glob.sync("./api/**/*") || []), "index.server.js"].filter(
  (file) => {
    return fs.existsSync(file) && !fs.lstatSync(file).isDirectory();
  }
);

const cjsPlugins = [
  resolve({
    preferBuiltins: true,
  }),
  commonjs({
    ignoreDynamicRequires: true,
  }),
  json(),
  copy({
    targets: [
      { src: "public/**/*", dest: ".joystick/build/public" },
      { src: "index.html", dest: ".joystick/build" },
      { src: "joystick.config.js", dest: ".joystick/build" },
      { src: "package.json", dest: ".joystick/build" },
    ],
  }),
];

const umdFiles = [
  ...(glob.sync("./ui/**/*") || []),
  ...(glob.sync("./lib/**/*") || []),
  ...(glob.sync("./i18n/**/*") || []),
  "index.client.js",
].filter((file) => {
  return fs.existsSync(file) && !fs.lstatSync(file).isDirectory();
});

const umdPlugins = [
  resolve(),
  commonjs({
    ignoreDynamicRequires: true,
  }),
];

const uiFiles = [...(glob.sync("./ui/**/*") || []), "index.client.js"].filter(
  (file) => {
    return fs.existsSync(file) && !fs.lstatSync(file).isDirectory();
  }
);

if (process.env.NODE_ENV !== "development") {
  cjsPlugins.push(terser());
  umdPlugins.push(terser());
}

module.exports = [
  ...(cjsFiles.map((path) => {
    return {
      input: path,
      output: {
        exports: "auto",
        file: `.joystick/build/${path.replace("./", "")}`,
        name: "node",
        format: "cjs", // umd, cjs
      },
      plugins: cjsPlugins,
    };
  }) || []),
  ...(umdFiles.map((path) => {
    return {
      input: path,
      output: {
        exports: "auto",
        file: `.joystick/build/${path.replace("./src/", "").replace("./", "")}`,
        name: "joystick",
        format: "umd",
      },
      plugins: umdPlugins,
    };
  }) || []),
  ...(uiFiles.map((path) => {
    return {
      input: path,
      output: {
        exports: "auto",
        file: `.joystick/build/public/js/${path
          .replace("./src/", "")
          .replace("./", "")}`,
        name: "joystick",
        format: "umd",
      },
      plugins: umdPlugins,
    };
  }) || []),
];
