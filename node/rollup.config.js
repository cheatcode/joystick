import glob from "glob";
import fs from "fs";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { terser } from "rollup-plugin-terser";
import html from "rollup-plugin-html";

const files = [...(glob.sync("./src/**/*") || [])].filter((file) => {
  return fs.existsSync(file) && !fs.lstatSync(file).isDirectory();
});

const plugins = [
  resolve({
    preferBuiltins: true,
  }),
  commonjs(),
  json(),
  html(),
];

if (process.env.NODE_ENV !== "development") {
  plugins.push(terser());
}

export default files.map((path) => {
  return {
    external: [
      // npm:ws package optional dependencies
      "bufferutil",
      "utf-8-validate",
      // Databases
      "mongodb",
      // Accounts
      "crypto-extra",
      "dayjs",
      "bcrypt",
      "chalk",
      "nodemailer",
      "html-to-text",
      "juice",
    ],
    input: path,
    output: {
      name: "joystick-node",
      exports: "auto",
      file: `dist/${path.replace("./src/", "")}`,
      format: "umd",
    },
    plugins,
  };
});
