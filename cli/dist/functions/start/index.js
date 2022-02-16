import child_process from "child_process";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import ps from "ps-node";
import watch from "node-watch";
import fs from "fs";
import { kill as killPortProcess } from "cross-port-killer";
import chokidar from "chokidar";
import Loader from "../../lib/loader.js";
import getFilesToBuild from "./getFilesToBuild.js";
import buildFiles from "./buildFiles.js";
import filesToCopy from "./filesToCopy.js";
import checkIfPortAvailable from "./checkIfPortAvailable.js";
import getCodependenciesForFile from "./getCodependenciesForFile.js";
import isValidJSONString from "../../lib/isValidJSONString.js";
import startDatabaseProvider from "./databases/startProvider.js";
import CLILog from "../../lib/CLILog.js";
import removeDeletedDependenciesFromMap from "./removeDeletedDependenciesFromMap.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const isObject = (value) => {
  return !!(value && typeof value === "object" && !Array.isArray(value));
};
const watchlist = [
  { path: "ui" },
  { path: "lib" },
  { path: "i18n" },
  { path: "api" },
  { path: "email" },
  { path: "fixtures" },
  { path: "routes" },
  { path: "index.client.js" },
  { path: "index.server.js" },
  ...filesToCopy
];
const requiredFileCheck = () => {
  return new Promise((resolve) => {
    const requiredFiles = [
      { path: "index.server.js", type: "file" },
      { path: "index.html", type: "file" },
      { path: "index.client.js", type: "file" },
      { path: "api", type: "directory" },
      { path: "i18n", type: "directory" },
      { path: "lib", type: "directory" },
      { path: "public", type: "directory" },
      { path: "ui", type: "directory" },
      { path: "ui/components", type: "directory" },
      { path: "ui/layouts", type: "directory" },
      { path: "ui/pages", type: "directory" }
    ];
    requiredFiles.forEach((requiredFile) => {
      const exists = fs.existsSync(`${process.cwd()}/${requiredFile.path}`);
      const stats = exists && fs.statSync(`${process.cwd()}/${requiredFile.path}`);
      const isFile = stats && stats.isFile();
      const isDirectory = stats && stats.isDirectory();
      if (requiredFile && requiredFile.type === "file") {
        if (!exists || exists && !isFile) {
          CLILog(`The path ${requiredFile.path} must exist in your project and must be a file (not a directory).`, {
            level: "danger",
            docs: "https://github.com/cheatcode/joystick#folder-and-file-structure"
          });
          process.exit(0);
        }
      }
      if (requiredFile && requiredFile.type === "directory") {
        if (!exists || exists && !isDirectory) {
          CLILog(`The path ${requiredFile.path} must exist in your project and must be a directory (not a file).`, {
            level: "danger",
            docs: "https://github.com/cheatcode/joystick#folder-and-file-structure"
          });
          process.exit(0);
        }
      }
    });
    resolve();
  });
};
const handleCleanup = (processIds = []) => {
  process.loader.stop();
  Object.entries(process.databases || {}).forEach(([_databaseName, databaseInstance]) => {
    if (databaseInstance?.pid) {
      ps.kill(databaseInstance.pid);
    }
  });
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
        CLILog(error.toString(), {
          level: "danger",
          docs: "https://github.com/cheatcode/joystick"
        });
      });
      process.hmrProcess.stdout.on("data", (data) => {
        console.log(data.toString());
      });
      process.hmrProcess.stderr.on("data", (data) => {
        process.loader.stop();
        CLILog(data.toString(), {
          level: "danger",
          docs: "https://github.com/cheatcode/joystick"
        });
      });
    }
  } catch (exception) {
    throw new Error(`[dev.handleHMRProcessSTDIO] ${exception.message}`);
  }
};
const startHMRProcess = () => {
  const hmrProcess = child_process.fork(path.resolve(`${__dirname}/hmrServer.js`), [], {
    execArgv: ["--no-warnings", "--experimental-specifier-resolution=node"],
    silent: true
  });
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
          if (message && !message.includes("BUILD_ERROR")) {
            console.log(message);
          }
        }
      });
      process.serverProcess.stderr.on("data", (data) => {
        process.loader.stop();
        CLILog(data.toString(), {
          level: "danger",
          docs: "https://github.com/cheatcode/joystick"
        });
      });
    }
  } catch (exception) {
    throw new Error(`[dev.handleServerProcessSTDIO] ${exception.message}`);
  }
};
const startApplicationProcess = () => {
  const serverProcess = child_process.fork(path.resolve(".joystick/build/index.server.js"), [], {
    execArgv: ["--no-warnings", "--experimental-specifier-resolution=node"],
    silent: true,
    env: {
      FORCE_COLOR: "1",
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      JOYSTICK_SETTINGS: process.env.JOYSTICK_SETTINGS,
      databases: JSON.stringify(process.databases)
    }
  });
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
  process.loader.text("Starting app...");
  startApplicationProcess();
  startHMRProcess();
};
const initialBuild = async () => {
  const buildPath = `.joystick/build`;
  const fileMapPath = `.joystick/build/fileMap.json`;
  if (!fs.existsSync(buildPath)) {
    fs.mkdirSync(".joystick/build");
  }
  if (fs.existsSync(fileMapPath)) {
    fs.unlinkSync(fileMapPath);
  }
  process.loader.text("Building app...");
  await requiredFileCheck();
  const filesToBuild = getFilesToBuild();
  const fileResults = await buildFiles(filesToBuild);
  const hasErrors = [...fileResults].filter((result) => !!result).map(({ success }) => success).includes(false);
  if (!hasErrors) {
    startApplicationProcess();
    startHMRProcess();
  }
};
const startWatcher = async () => {
  await initialBuild();
  const watcher = chokidar.watch(watchlist.map(({ path: path2 }) => path2), {
    ignoreInitial: true
  });
  watcher.on("all", async (event, path2) => {
    await requiredFileCheck();
    process.loader.text("Rebuilding app...");
    if (["addDir"].includes(event) && fs.existsSync(path2) && fs.lstatSync(path2).isDirectory() && !fs.existsSync(`./.joystick/build/${path2}`)) {
      fs.mkdirSync(`./.joystick/build/${path2}`);
      restartApplicationProcess();
    }
    if (!!filesToCopy.find((fileToCopy) => fileToCopy.path === path2)) {
      const isDirectory = fs.statSync(path2).isDirectory();
      if (isDirectory && !fs.existsSync(`./.joystick/build/${path2}`)) {
        fs.mkdirSync(`./.joystick/build/${path2}`);
      }
      if (!isDirectory) {
        fs.writeFileSync(`./.joystick/build/${path2}`, fs.readFileSync(path2));
      }
      await loadSettings();
      return restartApplicationProcess();
    }
    if (["add", "change"].includes(event) && fs.existsSync(path2)) {
      const codependencies = getCodependenciesForFile(path2);
      const fileResults = await buildFiles([path2]);
      const fileResultsHaveErrors = fileResults.filter((result) => !!result).map(({ success }) => success).includes(false);
      removeDeletedDependenciesFromMap(codependencies.deleted);
      const codependencyResult = fileResultsHaveErrors ? [] : await buildFiles(codependencies.existing);
      const codependencyResultsHaveErrors = codependencyResult.filter((result) => !!result).map(({ success }) => success).includes(false);
      const hasErrors = fileResultsHaveErrors || codependencyResultsHaveErrors;
      if (process.serverProcess && hasErrors) {
        process.serverProcess.send(JSON.stringify({
          error: "BUILD_ERROR",
          paths: [...fileResults, ...codependencyResult].filter(({ success }) => !success).map(({ path: pathWithError, error }) => ({ path: pathWithError, error }))
        }));
      }
      if (!hasErrors) {
        process.initialBuildComplete = true;
        restartApplicationProcess();
      }
    }
    if (["unlink", "unlinkDir"].includes(event) && !fs.existsSync(`./.joystick/build/${path2}`)) {
      restartApplicationProcess();
    }
    if (["unlink", "unlinkDir"].includes(event) && fs.existsSync(`./.joystick/build/${path2}`)) {
      const pathToUnlink = `./.joystick/build/${path2}`;
      const stats = fs.lstatSync(pathToUnlink);
      if (stats.isDirectory()) {
        fs.rmdirSync(pathToUnlink, { recursive: true });
      }
      if (stats.isFile()) {
        fs.unlinkSync(pathToUnlink);
      }
      restartApplicationProcess();
    }
  });
};
const startDatabase = async (database = {}, databasePort = 2610) => {
  if (database.provider && database.provider === "mongodb") {
    await startDatabaseProvider("mongodb", database, databasePort);
  }
  if (database.provider && database.provider === "postgresql") {
    await startDatabaseProvider("postgresql", database, databasePort);
  }
  return Promise.resolve();
};
const validateDatabases = (databases = []) => {
  const databasesNotAsObjects = databases.filter((database) => !isObject(database));
  const userDatabases = databases.filter((database) => !!database.users);
  const databasesWithDuplicateNames = databases.flatMap((database, index) => {
    return databases.map((currentDatabase, currentIndex) => {
      if (index === currentIndex)
        return null;
      if (currentDatabase.provider === database.provider) {
        return database;
      }
    });
  }).filter((database) => !!database);
  if (databasesNotAsObjects && databasesNotAsObjects.length > 0) {
    CLILog(`Please ensure that each database in the config.databases array in your settings.${process.env.NODE_ENV}.json is an object. Correct the array and restart your app.`, {
      level: "danger",
      docs: "https://github.com/cheatcode/joystick#databases"
    });
    process.exit(1);
  }
  if (userDatabases && userDatabases.length > 1) {
    CLILog(`Please select a single database for your user accounts and restart your app.`, {
      level: "danger",
      docs: "https://github.com/cheatcode/joystick#users-database"
    });
    process.exit(1);
  }
  if (databasesWithDuplicateNames && databasesWithDuplicateNames.length > 1) {
    CLILog(`Please only specify a database provider once. Remove any duplicates from the config.databases array in your settings.${process.env.NODE_ENV}.json and restart your app.`, {
      level: "danger",
      docs: "https://github.com/cheatcode/joystick#databases"
    });
    process.exit(1);
  }
  return true;
};
const startDatabases = async (databasePortStart = 2610) => {
  try {
    const hasSettings = !!process.env.JOYSTICK_SETTINGS;
    const settings = hasSettings && JSON.parse(process.env.JOYSTICK_SETTINGS);
    const databases = settings?.config?.databases || [];
    if (databases && Array.isArray(databases) && databases.length > 0) {
      validateDatabases(databases);
      await Promise.all(databases.map((database, index) => startDatabase(database, databasePortStart + index)));
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
    CLILog(`A settings file could not be found for this environment (${environment}). Create a settings.${environment}.json file at the root of your project and restart Joystick.`, {
      level: "danger",
      docs: "https://github.com/cheatcode/joystick#settings"
    });
    process.exit(0);
  }
  const rawSettingsFile = fs.readFileSync(settingsFilePath, "utf-8");
  const isValidJSON = isValidJSONString(rawSettingsFile);
  if (!isValidJSON) {
    CLILog(`Failed to parse settings file. Double-check the syntax in your settings.${environment}.json file at the root of your project and restart Joystick.`, {
      level: "danger",
      docs: "https://github.com/cheatcode/joystick#settings",
      tools: [
        { title: "JSON Linter", url: "https://jsonlint.com/" }
      ]
    });
    process.exit(0);
  }
  const settingsFile = isValidJSON ? rawSettingsFile : "{}";
  process.env.JOYSTICK_SETTINGS = settingsFile;
  return settingsFile;
};
const checkIfJoystickProject = () => {
  return fs.existsSync(`${process.cwd()}/.joystick`);
};
var start_default = async (args = {}, options = {}) => {
  process.loader = new Loader({ defaultMessage: "Starting app..." });
  const port = options?.port ? parseInt(options?.port) : 2600;
  const databasePortStart = port + 10;
  const isJoystickProject = checkIfJoystickProject();
  if (!isJoystickProject) {
    CLILog("This is not a Joystick project. A .joystick folder could not be found.", {
      level: "danger",
      docs: "https://github.com/cheatcode/joystick"
    });
    process.exit(0);
  }
  await killPortProcess(port);
  process.title = "joystick";
  process.env.NODE_ENV = options?.environment || "development";
  process.env.PORT = options?.port ? parseInt(options?.port) : 2600;
  await loadSettings();
  await startDatabases(databasePortStart);
  startWatcher();
  handleSignalEvents([]);
};
export {
  start_default as default
};
