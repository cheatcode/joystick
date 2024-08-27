import fs from "fs";
import esbuild from "esbuild";
import path_exists from "../path_exists.js";

const { readFile, writeFile } = fs.promises;

const minify_file = async (path = "") => {
  if (await path_exists(path)) {
    const file = await readFile(path, "utf-8");
    console.log(path);
    const minified = await esbuild.transform(file, {
      minify: true,
    }).catch((error) => {
      console.warn(error);
    });

    if (minified?.code) {
      await writeFile(path, minified.code);
    }
  }
};

export default minify_file;
