import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import chalk from "chalk";
import { exec } from "child_process";
import buildPackageJSON from "./buildPackageJSON.js";
import Loader from "../../lib/loader.js";

const npmRegistry =
  process.env.NODE_ENV === "development"
    ? "--registry http://localhost:4873"
    : "";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const createFiles = (projectName, files = []) => {
  files.forEach(({ name, content }) => {
    fs.writeFileSync(`./${projectName}/${name}`, content);
  });
};

const createFolders = (projectName, folders = []) => {
  folders.forEach((folder) => {
    fs.mkdirSync(`./${projectName}/${folder}`);
  });
};

const createPackageJSON = (projectName = "") => {
  fs.writeFileSync(
    `./${projectName}/package.json`,
    buildPackageJSON(projectName)
  );
};

const createJoystickFolder = (projectName = "") => {
  fs.mkdirSync(`./${projectName}/.joystick`);
  fs.mkdirSync(`./${projectName}/.joystick/build`);
};

const createProjectFolder = (projectName = "") => {
  return fs.mkdirSync(`./${projectName}`);
};

const checkIfProjectExists = (projectName = "") => {
  return fs.existsSync(`./${projectName}`);
};

export default (args = {}) => {
  try {
    process.loader = new Loader({ defaultMessage: "Starting app..." });
    process.loader.text("Creating app...");

    const projectName = args?.name;
    const projectAlreadyExists = checkIfProjectExists(projectName);

    if (projectAlreadyExists) {
      console.log(
        chalk.red(
          `A folder with the name ${projectName} already exists. Please choose a different name and try again.`
        )
      );
      process.exit(0);
    }

    createProjectFolder(projectName);
    createJoystickFolder(projectName);
    createPackageJSON(projectName);

    createFolders(projectName, [
      "api",
      "i18n",
      "ui",
      "ui/components",
      "ui/components/button",
      "ui/layouts",
      "ui/layouts/app",
      "ui/pages",
      "ui/pages/error",
      "ui/pages/index",
      "lib",
      "public",
    ]);

    createFiles(projectName, [
      {
        name: "api/index.js",
        content: fs.readFileSync(
          `${__dirname}/templates/api/index.js`,
          "utf-8"
        ),
      },
      {
        name: "i18n/en-US.js",
        content: fs.readFileSync(
          `${__dirname}/templates/i18n/en-US.js`,
          "utf-8"
        ),
      },
      {
        name: "public/apple-touch-icon-152x152.png",
        content: fs.readFileSync(
          `${__dirname}/templates/public/apple-touch-icon-152x152.png`
        ),
      },
      {
        name: "public/favicon.ico",
        content: fs.readFileSync(`${__dirname}/templates/public/favicon.ico`),
      },
      {
        name: "public/manifest.json",
        content: fs.readFileSync(`${__dirname}/templates/public/manifest.json`),
      },
      {
        name: "public/service-worker.js",
        content: fs.readFileSync(
          `${__dirname}/templates/public/service-worker.js`
        ),
      },
      {
        name: "public/splash-screen-1024x1024.png",
        content: fs.readFileSync(
          `${__dirname}/templates/public/splash-screen-1024x1024.png`
        ),
      },
      {
        name: "ui/components/button/index.js",
        content: fs.readFileSync(
          `${__dirname}/templates/ui/components/button/index.js`,
          "utf-8"
        ),
      },
      {
        name: "ui/layouts/app/index.js",
        content: fs.readFileSync(
          `${__dirname}/templates/ui/layouts/app/index.js`,
          "utf-8"
        ),
      },
      {
        name: "ui/pages/error/index.js",
        content: fs.readFileSync(
          `${__dirname}/templates/ui/pages/error/index.js`,
          "utf-8"
        ),
      },
      {
        name: "ui/pages/index/index.js",
        content: fs.readFileSync(
          `${__dirname}/templates/ui/pages/index/index.js`,
          "utf-8"
        ),
      },
      {
        name: "index.client.js",
        content: fs.readFileSync(
          `${__dirname}/templates/index.client.js`,
          "utf-8"
        ),
      },
      {
        name: "index.css",
        content: fs.readFileSync(`${__dirname}/templates/index.css`, "utf-8"),
      },
      {
        name: "index.html",
        content: fs.readFileSync(`${__dirname}/templates/index.html`, "utf-8"),
      },
      {
        name: "index.server.js",
        content: fs.readFileSync(
          `${__dirname}/templates/index.server.js`,
          "utf-8"
        ),
      },
      {
        name: "settings.development.json",
        content: fs.readFileSync(
          `${__dirname}/templates/settings.development.json`,
          "utf-8"
        ),
      },
    ]);

    // NOTE: Pure aesthetics. Above step completes so quickly that it almost looks like
    // it's skipped. Add a buffer of 1.5s here to make for a better dev experience.
    setTimeout(() => {
      process.loader.text("Installing dependencies...");
    }, 1500);

    exec(
      `cd ./${projectName} && npm install --save @joystick.js/ui @joystick.js/node ${npmRegistry}`,
      (stderr, stdout) => {
        if (stderr) {
          process.loader.stop();
          console.warn(stderr);
        } else {
          process.loader.stop();
          console.log(
            `${chalk.green(
              "Project created! To get started, run:"
            )}\ncd ${projectName} && joystick start`
          );
        }
      }
    );
  } catch (exception) {
    console.warn(exception);
  }
};
