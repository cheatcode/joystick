import fs from "fs";
import child_process from 'child_process';
import path from "path";
import esbuild from "esbuild";
import getFilesToBuild from "./getFilesToBuild.js";
import replaceBackslashesWithForwardSlashes from '../src/lib/replaceBackslashesWithForwardSlashes.js';

const checkIfBrowserFile = (path = "") => {
  const browserPaths = [
    "app/utils/process.js",
    "app/middleware/hmr/client.js"
  ];

  return browserPaths.some((browserPath) => {
    return path.includes(browserPath);
  });
};

const buildFile = (fileToBuild) => {
  const [_, file] = fileToBuild.split(replaceBackslashesWithForwardSlashes("src/"));
  const isBrowserFile = checkIfBrowserFile(replaceBackslashesWithForwardSlashes(file));

  return esbuild
    .build({
      entryPoints: [`src/${file}`],
      bundle: isBrowserFile,
      outfile: `./dist/${file}`,
      platform: isBrowserFile ? "browser" : "node",
      format: "esm",
      minify: false,
      plugins: [],
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
    const [_, file] = fileToCopy.path.split(replaceBackslashesWithForwardSlashes("src/"));
    fs.mkdir(`./dist/${path.dirname(file)}`, { recursive: true }, (error) => {
      if (error) {
        console.warn(error);
      }
      fs.writeFileSync(`./dist/${file}`, fs.readFileSync(replaceBackslashesWithForwardSlashes(`src/${file}`)));
    });
  });
};

const filesToBuild = getFilesToBuild();

const isNotJavaScript = (path = "") => {
  const extension = path.split('.').pop();
  return extension && !extension.match(/\js$/);
};

const files = filesToBuild.map((path) => {
  let target = "esm";

  const platformSafePath = replaceBackslashesWithForwardSlashes(path);

  const copyPaths = [
    replaceBackslashesWithForwardSlashes("email/templates/base.html"),
  ];

  const isCopyPath = isNotJavaScript(platformSafePath) || copyPaths.some((copyPath) => {
    return path.includes(copyPath);
  });

  if (isCopyPath) {
    target = "copy";
  }

  return {
    path: platformSafePath,
    target,
  };
});

if (fs.existsSync('dist')) {
  child_process.execSync('rm -rf ./dist');
}

copyFiles(files.filter(({ target }) => target === "copy"));
buildFiles(files.filter(({ target }) => target !== "copy"));
