/* eslint-disable consistent-return */

import chalk from "chalk";
import child_process from "child_process";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import ps from "ps-node";
import watch from "node-watch";
import fs from "fs";
import Loader from "../../lib/loader.js";
import getFilesToBuild from "./getFilesToBuild.js";
import buildFiles from "./buildFiles.js";
import filesToCopy from "./filesToCopy.js";
import checkIfPortAvailable from "./checkIfPortAvailable.js";
import getCodependenciesForFile from "./getCodependenciesForFile.js";
import isValidJSONString from "../../lib/isValidJSONString.js";
import startDatabaseProvider from "./databases/startProvider.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isObject = (value) => {
  return !!(value && typeof value === "object" && !Array.isArray(value));
};

const watchlist = [
  { path: "./ui" },
  { path: "./lib" },
  { path: "./i18n" },
  { path: "./index.client.js" },
  { path: "./api" },
  { path: "./email" },
  { path: "./index.server.js" },
  ...filesToCopy,
];

const handleCleanup = (processIds = []) => {
  process.loader.stop();

  Object.entries(process.databases || {}).forEach(
    ([_databaseName, databaseInstance]) => {
      if (databaseInstance?.pid) {
        ps.kill(databaseInstance.pid);
      }
    }
  );

  processIds.forEach((processId) => {
    ps.kill(processId);
  });

  process.exit();
};

const handleSignalEvents = (processIds = []) => {
  process.on("SIGINT", () => handleCleanup(processIds));
  process.on("SIGTERM", () => handleCleanup(processIds));
};

const handleHMRProcessMessages = () => {
  process.hmrProcess.on("message", (message) => {
    const processMessages = ["server_closed"];

    if (!processMessages.includes(message)) {
      process.loader.stable(message);
    }
  });
};

const handleHMRProcessSTDIO = () => {
  try {
    if (process.hmrProcess) {
      process.hmrProcess.on("error", (error) => {
        console.log(error);
      });

      process.hmrProcess.stdout.on("data", (data) => {
        console.log(data.toString());
      });

      process.hmrProcess.stderr.on("data", (data) => {
        process.loader.stop();
        console.log(chalk.redBright(data.toString()));
      });
    }
  } catch (exception) {
    throw new Error(`[dev.handleHMRProcessSTDIO] ${exception.message}`);
  }
};

const startHMRProcess = () => {
  const hmrProcess = child_process.fork(
    path.resolve(`${__dirname}/hmrServer.js`),
    [],
    {
      execArgv: ["--no-warnings", "--experimental-specifier-resolution=node"],
      // NOTE: Pipe stdin, stdout, and stderr. IPC establishes a message channel so we
      // communicate with the child_process.
      silent: true,
    }
  );

  process.hmrProcess = hmrProcess;

  handleHMRProcessSTDIO();
  handleHMRProcessMessages();
};

const handleServerProcessMessages = () => {
  process.serverProcess.on("message", (message) => {
    const processMessages = ["server_closed"];

    if (!processMessages.includes(message)) {
      process.loader.stable(message);
    }
  });
};

const handleServerProcessSTDIO = () => {
  try {
    if (process.serverProcess) {
      process.serverProcess.on("error", (error) => {
        console.log(error);
      });

      process.serverProcess.stdout.on("data", (data) => {
        const message = data.toString();

        if (message && message.includes("App running at:")) {
          process.loader.stable(message);
        } else {
          console.log(message);
        }
      });

      process.serverProcess.stderr.on("data", (data) => {
        process.loader.stop();
        console.log(chalk.redBright(data.toString()));
      });
    }
  } catch (exception) {
    throw new Error(`[dev.handleServerProcessSTDIO] ${exception.message}`);
  }
};

const startApplicationProcess = () => {
  const serverProcess = child_process.fork(
    path.resolve(".joystick/build/index.server.js"),
    [],
    {
      execArgv: ["--no-warnings", "--experimental-specifier-resolution=node"],
      // NOTE: Pipe stdin, stdout, and stderr. IPC establishes a message channel so we
      // communicate with the child_process.
      silent: true,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        JOYSTICK_SETTINGS: process.env.JOYSTICK_SETTINGS,
        databases: JSON.stringify(process.databases),
      },
    }
  );

  process.serverProcess = serverProcess;

  handleServerProcessSTDIO();
  handleServerProcessMessages();
};

const restartApplicationProcess = () => {
  if (process.serverProcess && process.serverProcess.pid) {
    process.loader.text("Restarting app...");
    ps.kill(process.serverProcess.pid);
    return startApplicationProcess();
  }

  // NOTE: Original process was never initialized due to an error.
  process.loader.text("Starting app...");
  startApplicationProcess();
  startHMRProcess();
};

const initialBuild = async (path, format) => {
  const buildPath = `.joystick/build`;
  const fileMapPath = `.joystick/build/fileMap.json`;

  if (!fs.existsSync(buildPath)) {
    fs.mkdirSync(".joystick/build");
  }

  if (fs.existsSync(fileMapPath)) {
    fs.unlinkSync(fileMapPath);
  }

  process.loader.text("Building app...");

  const filesToBuild = getFilesToBuild();
  const fileResults = await buildFiles(filesToBuild);

  const hasErrors = [...fileResults]
    .filter((result) => !!result)
    .map(({ success }) => success)
    .includes(false);

  if (!hasErrors) {
    startApplicationProcess();
    startHMRProcess();
  }
};

const startWatcher = async () => {
  await initialBuild();

  watchlist.forEach(({ path }) => {
    if (fs.existsSync(`./${path}`)) {
      watch(path, { recursive: true }, async function (event, name) {
        process.loader.text("Rebuilding app...");

        if (
          event === "update" &&
          fs.existsSync(`./${name}`) &&
          fs.lstatSync(`./${name}`).isDirectory()
        ) {
          fs.mkdirSync(`./.joystick/build/${name}`);
          restartApplicationProcess();
        }

        // TODO: Is this correct? If it's a copy, why am I building it after?
        if (!!filesToCopy.find((fileToCopy) => fileToCopy.path === name)) {
          fs.writeFileSync(`./.joystick/build/${name}`, fs.readFileSync(name));

          const codependencies = getCodependenciesForFile(name);

          const fileResults = await buildFiles([name]);
          const codependencyResult = await buildFiles(codependencies);

          const hasErrors = [...fileResults, ...codependencyResult]
            .filter((result) => !!result)
            .map(({ success }) => success)
            .includes(false);

          if (process.serverProcess && hasErrors) {
            process.serverProcess.send(
              JSON.stringify({
                error: "BUILD_ERROR",
                paths: [...fileResults, ...codependencyResult]
                  .filter(({ success }) => !success)
                  .map(({ path, error }) => ({ path, error })),
              })
            );
          }

          if (!hasErrors) {
            await loadSettings();
            return restartApplicationProcess();
          }
        }

        if (event === "update") {
          const codependencies = getCodependenciesForFile(name);

          const fileResults = await buildFiles([name]);
          const codependencyResult = await buildFiles(codependencies);

          const hasErrors = [...fileResults, ...codependencyResult]
            .filter((result) => !!result)
            .map(({ success }) => success)
            .includes(false);

          if (process.serverProcess && hasErrors) {
            process.serverProcess.send(
              JSON.stringify({
                error: "BUILD_ERROR",
                paths: [...fileResults, ...codependencyResult]
                  .filter(({ success }) => !success)
                  .map(({ path, error }) => ({ path, error })),
              })
            );
          }

          if (!hasErrors) {
            restartApplicationProcess();
          }
        }

        if (event === "remove" && !fs.existsSync(`./.joystick/build/${name}`)) {
          restartApplicationProcess();
        }

        if (event === "remove" && fs.existsSync(`./.joystick/build/${name}`)) {
          const path = `./.joystick/build/${name}`;
          const stats = fs.lstatSync(path);

          if (stats.isDirectory()) {
            fs.rmdirSync(path, { recursive: true });
          }

          if (stats.isFile()) {
            fs.unlinkSync(path);
          }

          restartApplicationProcess();
        }
      });
    }
  });
};

const startDatabase = async (database = {}) => {
  // validateDatabase(databases);

  if (database.provider && database.provider === "mongodb") {
    await startDatabaseProvider("mongodb", database);
  }

  return Promise.resolve();
};

const validateDatabases = (databases = []) => {
  const databasesNotAsObjects = databases.filter(
    (database) => !isObject(database)
  );
  const userDatabases = databases.filter((database) => !!database.users);
  const databasesWithDuplicateNames = databases
    .flatMap((database, index) => {
      return databases.map((currentDatabase, currentIndex) => {
        if (index === currentIndex) return null;
        if (currentDatabase.provider === database.provider) {
          return database;
        }
      });
    })
    .filter((database) => !!database);

  if (databasesNotAsObjects && databasesNotAsObjects.length > 0) {
    console.log(
      chalk.red(
        "Please ensure that each database in the config.databases array is an object. Correct the array and restart your app."
      )
    );
    process.exit(1);
  }

  if (userDatabases && userDatabases.length > 1) {
    console.log(
      chalk.red(
        "Please select a single database for your user accounts and restart your app."
      )
    );
    process.exit(1);
  }

  if (databasesWithDuplicateNames && databasesWithDuplicateNames.length > 1) {
    console.log(
      chalk.red(
        "Please only specify a database provider once. Remove any duplicates from your config.databases array and restart your app."
      )
    );
    process.exit(1);
  }

  return true;
};

const startDatabases = async () => {
  try {
    const hasSettings = !!process.env.JOYSTICK_SETTINGS;
    const settings = hasSettings && JSON.parse(process.env.JOYSTICK_SETTINGS);
    const databases = settings?.config?.databases || [];

    if (databases && Array.isArray(databases) && databases.length > 0) {
      validateDatabases(databases);
      await Promise.all(databases.map((database) => startDatabase(database)));
      return Promise.resolve();
    }

    return Promise.resolve();
  } catch (exception) {
    console.warn(exception);
  }
};

const loadSettings = async () => {
  const environment = process.env.NODE_ENV;
  const settingsFilePath = `${process.cwd()}/settings.${environment}.json`;
  const hasSettingsFile = fs.existsSync(settingsFilePath);

  if (!hasSettingsFile) {
    console.warn(
      `A settings file could not be found for this environment. If you have settings for this environment (${environment}), creating a settings.${environment}.js at the root of your project and restart Joystick.`
    );
    process.env.JOYSTICK_SETTINGS = {};
    return;
  }

  const rawSettingsFile = fs.readFileSync(settingsFilePath, "utf-8");
  const settingsFile = isValidJSONString(rawSettingsFile)
    ? rawSettingsFile
    : "{}";

  // NOTE: Child process will inherit this env var from this parent process.
  process.env.JOYSTICK_SETTINGS = settingsFile;

  return settingsFile;
};

const checkIfJoystickProject = () => {
  return fs.existsSync(`${process.cwd()}/.joystick`);
};

export default async (options = {}) => {
  process.loader = new Loader({ defaultMessage: "Starting app..." });

  const port = options?.port ? parseInt(options?.port) : 2600;
  const isJoystickProject = checkIfJoystickProject();
  const portIsAvailable = await checkIfPortAvailable(port);

  if (!isJoystickProject) {
    console.log(
      chalk.yellowBright(
        `This is not a Joystick project. A .joystick folder could not be found. Double-check you're in the right folder or create a new project with joystick create <project>`
      )
    );
    return;
  }

  if (portIsAvailable) {
    process.env.NODE_ENV = options?.environment || "development";
    process.env.PORT = options?.port ? parseInt(options?.port) : 2600;

    await loadSettings();
    await startDatabases();

    startWatcher();
    handleSignalEvents([]);
  } else {
    console.log(
      `Port ${port} is already in use. Free up that port or pass another port with joystick start --port <PORT>.`
    );
  }
};
