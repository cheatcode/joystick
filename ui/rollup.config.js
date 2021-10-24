import glob from "glob";
import fs from "fs";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";

const files = [...(glob.sync("./src/**/*") || [])].filter((file) => {
  return fs.existsSync(file) && !fs.lstatSync(file).isDirectory();
});

const plugins = [resolve(), commonjs()];

if (process.env.NODE_ENV !== "development") {
  plugins.push(terser());
}

export default files.map((path) => {
  return {
    input: path,
    output: {
      exports: "auto",
      file: `dist/${path.replace("./src/", "")}`,
      name: "joystick-ui",
      format: "umd",
    },
    plugins,
  };
});
