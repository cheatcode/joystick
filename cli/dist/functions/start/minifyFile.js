import fs from "fs";
import esbuild from "esbuild";
var minifyFile_default = async (path = "") => {
  if (fs.existsSync(path)) {
    const file = fs.readFileSync(path, "utf-8");
    const minified = await esbuild.transform(file, { minify: true });
    fs.writeFileSync(path, minified.code);
  }
};
export {
  minifyFile_default as default
};
