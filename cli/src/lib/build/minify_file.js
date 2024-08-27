import fs from "fs";
import { minify } from "terser";
import path_exists from "../path_exists.js";

const { readFile, writeFile } = fs.promises;

const minify_file = async (path = "") => {
  if (await path_exists(path)) {
    const file = await readFile(path, "utf-8");
    console.log(path);
    const minified = await minify(file).catch((error) => {
      console.warn(error);
    });

    if (minified?.code) {
      await writeFile(path, minified.code);
    }
  }
};

export default minify_file;
