import fs from "fs";
import child_process from 'child_process';
import path from "path";
import esbuild from "esbuild";
import getFilesToBuild from "./getFilesToBuild.js";
import getPlatformSafePath from './getPlatformSafePath.js';

const buildFile = (fileToBuild) => {
  const [_, file] = fileToBuild.split(getPlatformSafePath("src/"));
  return esbuild
    .build({
      entryPoints: [`src/${file}`],
      bundle: true,
      outfile: `./dist/${file}`,
      platform: "browser",
      format: "esm",
      minify: true,
      plugins: [],
      external: [],
    })
    .catch((error) => {
      console.log(error);
    });
};

const buildFiles = (filesToBuild = []) => {
  return Promise.all(filesToBuild.map((file) => buildFile(file.path)));
};

const copyFiles = (filesToCopy = []) => {
  filesToCopy.forEach((fileToCopy) => {
    const [_, file] = fileToCopy.path.split(getPlatformSafePath("src/"));
    fs.mkdir(`./dist/${path.dirname(file)}`, { recursive: true }, (error) => {
      if (error) {
        console.warn(error);
      }
      fs.writeFileSync(`./dist/${file}`, fs.readFileSync(getPlatformSafePath(`src/${file}`)));
    });
  });
};

const filesToBuild = getFilesToBuild();

const files = filesToBuild.map((path) => {
  let target = "esm";

  const copyPaths = [];

  const isCopyPath = copyPaths.some((copyPath) => {
    return path.includes(copyPath);
  });

  if (isCopyPath) {
    target = "copy";
  }

  return {
    path,
    target,
  };
});

if (fs.existsSync('dist')) {
  child_process.execSync('rm -rf ./dist');
}

copyFiles(files.filter(({ target }) => target === "copy"));
buildFiles(files.filter(({ target }) => target !== "copy"));
