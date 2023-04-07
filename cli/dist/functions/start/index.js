import child_process from "child_process";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import ps from "ps-node";
import { kill as killPortProcess } from "cross-port-killer";
import watch from "node-watch";
import fs from "fs";
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
import validateDatabasesFromSettings from "../../lib/validateDatabasesFromSettings.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const killProcess = (pid = 0) => {
  return new Promise((resolve) => {
    ps.kill(pid, () => {
      resolve();
    });
  });
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
const handleCleanup = async (processIds = [
  process?.serverProcess?.pid,
  process?.hmrProcess?.pid
]) => {
  process.loader.text("Shutting down...");
  const databases = Object.entries(process.env.DATABASES || {});
  for (let i = 0; i < databases?.length; i += 1) {
    const databaseInstance = databases[i] && databases[i][1];
    if (databaseInstance?.pid) {
      await killProcess(databaseInstance.pid);
    }
  }
  for (let i = 0; i < processIds?.length; i += 1) {
    const processId = processIds[i];
    if (processId) {
      await killProcess(processId);
    }
  }
  process.loader.stop();
  process.exit();
};
const handleSignalEvents = (processIds = []) => {
  process.on("SIGINT", async () => {
    await handleCleanup(processIds);
  });
  process.on("SIGTERM", async () => {
    await handleCleanup(processIds);
  });
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
  const execArgv = [
    "--no-warnings",
    "--experimental-specifier-resolution=node"
  ];
  if (process.env.NODE_ENV === "development" && process.env.IS_DEBUG_MODE === "true") {
    execArgv.push("--inspect");
  }
  const serverProcess = child_process.fork(path.resolve(".joystick/build/index.server.js"), [], {
    execArgv,
    silent: true,
    env: {
      FORCE_COLOR: "1",
      LOGS_PATH: process.env.LOGS_PATH,
      NODE_ENV: process.env.NODE_ENV,
      ROOT_URL: process.env.ROOT_URL,
      PORT: process.env.PORT,
      JOYSTICK_SETTINGS: process.env.JOYSTICK_SETTINGS
    }
  });
  process.serverProcess = serverProcess;
  handleServerProcessSTDIO();
  handleServerProcessMessages();
};
const restartApplicationProcess = async () => {
  if (process.serverProcess && process.serverProcess.pid) {
    process.loader.text("Restarting app...");
    killPortProcess(process.env.PORT);
    killProcess(process.serverProcess.pid);
    return startApplicationProcess();
  }
  process.loader.text("Starting app...");
  startApplicationProcess();
  startHMRProcess();
};
const initialBuild = async (buildSettings = {}) => {
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
  const filesToBuild = getFilesToBuild(buildSettings?.excludedPaths, "start");
  const fileResults = await buildFiles(filesToBuild, null, process.env.NODE_ENV);
  const hasErrors = [...fileResults].filter((result) => !!result).map(({ success }) => success).includes(false);
  if (!hasErrors) {
    startApplicationProcess();
    startHMRProcess();
  }
};
const startWatcher = async (buildSettings = {}) => {
  await initialBuild(buildSettings);
  const watcher = chokidar.watch(watchlist.map(({ path: path2 }) => path2), {
    ignoreInitial: true
  });
  watcher.on("all", async (event, path2) => {
    await requiredFileCheck();
    process.loader.text("Rebuilding app...");
    if (["addDir"].includes(event) && fs.existsSync(path2) && fs.lstatSync(path2).isDirectory() && !fs.existsSync(`./.joystick/build/${path2}`)) {
      fs.mkdirSync(`./.joystick/build/${path2}`);
      await restartApplicationProcess();
    }
    if (!!filesToCopy.find((fileToCopy) => fileToCopy.path === path2)) {
      const isDirectory = fs.statSync(path2).isDirectory();
      if (isDirectory && !fs.existsSync(`./.joystick/build/${path2}`)) {
        fs.mkdirSync(`./.joystick/build/${path2}`);
      }
      if (!isDirectory) {
        fs.writeFileSync(`./.joystick/build/${path2}`, fs.readFileSync(path2));
      }
      await loadSettings(process.env.NODE_ENV);
      await restartApplicationProcess();
      return;
    }
    if (["add", "change"].includes(event) && fs.existsSync(path2)) {
      const codependencies = getCodependenciesForFile(path2);
      const fileResults = await buildFiles([path2], null, process.env.NODE_ENV);
      const fileResultsHaveErrors = fileResults.filter((result) => !!result).map(({ success }) => success).includes(false);
      removeDeletedDependenciesFromMap(codependencies.deleted);
      const codependencyResult = fileResultsHaveErrors ? [] : await buildFiles(codependencies.existing, null, process.env.NODE_ENV);
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
        await restartApplicationProcess();
        return;
      }
    }
    if (["unlink", "unlinkDir"].includes(event) && !fs.existsSync(`./.joystick/build/${path2}`)) {
      await restartApplicationProcess();
      return;
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
      await restartApplicationProcess();
      return;
    }
  });
};
const startDatabase = async (database = {}, databasePort = 2610) => {
  process.env.DATABASES = {
    ...process.env.DATABASES || {},
    [database.provider]: await startDatabaseProvider(database, databasePort)
  };
  return Promise.resolve();
};
const startDatabases = async (databasePortStart = 2610) => {
  try {
    const hasSettings = !!process.env.JOYSTICK_SETTINGS;
    const settings = hasSettings && JSON.parse(process.env.JOYSTICK_SETTINGS);
    const databases = settings?.config?.databases || [];
    if (databases && Array.isArray(databases) && databases.length > 0) {
      validateDatabasesFromSettings(databases);
      for (let i = 0; i < databases?.length; i += 1) {
        await startDatabase(databases[i], databasePortStart + i);
      }
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
  return JSON.parse(settingsFile);
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
  process.env.LOGS_PATH = options?.logs || null;
  process.env.NODE_ENV = options?.environment || "development";
  process.env.PORT = options?.port ? parseInt(options?.port) : 2600;
  process.env.IS_DEBUG_MODE = options?.debug;
  const settings = await loadSettings(process.env.NODE_ENV);
  await startDatabases(databasePortStart);
  startWatcher(settings?.config?.build);
  handleSignalEvents([]);
};
export {
  start_default as default
};
