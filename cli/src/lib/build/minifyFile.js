import fs from "fs";
import esbuild from "esbuild";
import path_exists from "../path_exists.js";

const { readFile, writeFile } = fs.promises;

export default async (path = "") => {
  if (await path_exists(path)) {
    const file = await readFile(path, "utf-8");
    const minified = await esbuild.transform(file, { minify: true });
    await writeFile(path, minified.code);
  }
};
