import fs from "fs";
import esbuild from "esbuild";

export default async (path = "") => {
  if (fs.existsSync(path)) {
    const file = fs.readFileSync(path, "utf-8");
    const minified = await esbuild.transform(file, { minify: true });
    fs.writeFileSync(path, minified.code);
  }
};
