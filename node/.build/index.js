import fs from "fs";
import path from "path";
import esbuild from "esbuild";
import getFilesToBuild from "./getFilesToBuild.js";

const checkIfBrowserFile = (path = "") => {
  const browserPaths = ["app/utils/process.js", "app/middleware/hmr/client.js"];

  return browserPaths.some((browserPath) => {
    return path.includes(browserPath);
  });
};

const buildFile = (fileToBuild) => {
  const [_, file] = fileToBuild.split("src/");
  const isBrowserFile = checkIfBrowserFile(file);

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
    const [_, file] = fileToCopy.path.split("src/");
    fs.mkdir(`./dist/${path.dirname(file)}`, { recursive: true }, (error) => {
      if (error) {
        console.warn(error);
      }
      fs.writeFileSync(`./dist/${file}`, fs.readFileSync(`src/${file}`));
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

  const copyPaths = [
    "email/templates/base.html",
  ];

  const isCopyPath = isNotJavaScript(path) || copyPaths.some((copyPath) => {
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

copyFiles(files.filter(({ target }) => target === "copy"));
buildFiles(files.filter(({ target }) => target !== "copy"));
