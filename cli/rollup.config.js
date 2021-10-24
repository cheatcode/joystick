const glob = require("glob");
const fs = require("fs");
const json = require("@rollup/plugin-json");
const hashbang = require("rollup-plugin-hashbang");
const copy = require("rollup-plugin-copy");
const { terser } = require("rollup-plugin-terser");

const files = [
  ...(glob.sync("./src/**/*", {
    ignore: [
      "./src/functions/create/templates/**/*",
      "./src/lib/rollup.config.js",
      "./src/functions/start/buildFile.js",
    ],
  }) || []),
].filter((file) => {
  return fs.existsSync(file) && !fs.lstatSync(file).isDirectory();
});

const plugins = [
  hashbang(),
  json(),
  copy({
    targets: [
      {
        src: "src/functions/create/templates",
        dest: "dist/functions/create",
      },
      {
        src: "src/functions/start/buildFile.js",
        dest: "dist/functions/start",
      },
      {
        src: "src/lib/rollup.config.js",
        dest: "dist/lib",
      },
    ],
  }),
];

if (process.env.NODE_ENV !== "development") {
  plugins.push(terser());
}

export default files.map((path) => {
  return {
    external: ["fsevents"],
    input: path,
    output: {
      exports: "auto",
      file: `dist/${path.replace("./src/", "")}`,
      format: "cjs",
    },
    plugins,
  };
});
