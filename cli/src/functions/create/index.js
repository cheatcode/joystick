import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import chalk from "chalk";
import { execSync } from "child_process";
import buildPackageJSON from "./buildPackageJSON.js";

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

export default (projectName) => {
  const projectAlreadyExists = checkIfProjectExists(projectName);

  if (projectAlreadyExists) {
    throw new Error(
      `A folder with the name ${projectName} already exists. Please choose a different name and try again.`
    );
  }

  createProjectFolder(projectName);
  createJoystickFolder(projectName);
  createPackageJSON(projectName);

  createFolders(projectName, [
    "api",
    "i18n",
    "ui",
    "ui/components",
    "ui/components/quote",
    "ui/pages",
    "ui/pages/index",
    "lib",
    "public",
  ]);

  createFiles(projectName, [
    {
      name: "api/index.js",
      content: fs.readFileSync(
        `${__dirname}/functions/create/templates/api/index.js`,
        "utf-8"
      ),
    },
    {
      name: "i18n/en-US.js",
      content: fs.readFileSync(
        `${__dirname}/functions/create/templates/i18n/en-US.js`,
        "utf-8"
      ),
    },
    {
      name: "ui/components/quote/index.js",
      content: fs.readFileSync(
        `${__dirname}/functions/create/templates/ui/components/quote/index.js`,
        "utf-8"
      ),
    },
    {
      name: "ui/pages/index/index.js",
      content: fs.readFileSync(
        `${__dirname}/functions/create/templates/ui/pages/index/index.js`,
        "utf-8"
      ),
    },
    {
      name: "public/favicon.ico",
      content: fs.readFileSync(
        `${__dirname}/functions/create/templates/public/favicon.ico`
      ),
    },
    {
      name: "public/apple-touch-icon-152x152.png",
      content: fs.readFileSync(
        `${__dirname}/functions/create/templates/public/apple-touch-icon-152x152.png`
      ),
    },
    {
      name: "index.client.js",
      content: fs.readFileSync(
        `${__dirname}/functions/create/templates/index.client.js`,
        "utf-8"
      ),
    },
    {
      name: "settings-development.js",
      content: fs.readFileSync(
        `${__dirname}/functions/create/templates/settings.env.js`,
        "utf-8"
      ),
    },
    {
      name: "settings-staging.js",
      content: fs.readFileSync(
        `${__dirname}/functions/create/templates/settings.env.js`,
        "utf-8"
      ),
    },
    {
      name: "settings-production.js",
      content: fs.readFileSync(
        `${__dirname}/functions/create/templates/settings.env.js`,
        "utf-8"
      ),
    },
    {
      name: "index.html",
      content: fs.readFileSync(
        `${__dirname}/functions/create/templates/index.html`,
        "utf-8"
      ),
    },
    {
      name: "index.server.js",
      content: fs.readFileSync(
        `${__dirname}/functions/create/templates/index.server.js`,
        "utf-8"
      ),
    },
  ]);

  execSync(
    `cd ./${projectName} && npm install --save @joystick.js/ui @joystick.js/node ${npmRegistry}`
  );

  console.log(`
    ${chalk.green("Project created! To get started, run:")}\n
    cd ${projectName} && joystick start
  `);
};
