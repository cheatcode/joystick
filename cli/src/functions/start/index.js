/* eslint-disable consistent-return */

import child_process from "child_process";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import ps from "ps-node";
import { killPortProcess } from "kill-port-process";
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
import wait from "../../lib/wait.js";

const majorVersion = parseInt(
  process?.version?.split(".")[0]?.replace("v", ""),
  10
);

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
  ...filesToCopy,
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
      { path: "ui/pages", type: "directory" },
    ];

    requiredFiles.forEach((requiredFile) => {
      const exists = fs.existsSync(`${process.cwd()}/${requiredFile.path}`);
      const stats =
        exists && fs.statSync(`${process.cwd()}/${requiredFile.path}`);
      const isFile = stats && stats.isFile();
      const isDirectory = stats && stats.isDirectory();

      if (requiredFile && requiredFile.type === "file") {
        if (!exists || (exists && !isFile)) {
          CLILog(
            `The path ${requiredFile.path} must exist in your project and must be a file (not a directory).`,
            {
              level: "danger",
              docs: "https://github.com/cheatcode/joystick#folder-and-file-structure",
            }
          );
          process.exit(0);
        }
      }

      if (requiredFile && requiredFile.type === "directory") {
        if (!exists || (exists && !isDirectory)) {
          CLILog(
            `The path ${requiredFile.path} must exist in your project and must be a directory (not a file).`,
            {
              level: "danger",
              docs: "https://github.com/cheatcode/joystick#folder-and-file-structure",
            }
          );
          process.exit(0);
        }
      }
    });

    resolve();
  });
};

const handleCleanup = async (
  processIds = [process?.serverProcess?.pid, process?.hmrProcess?.pid]
) => {
  for (let i = 0; i < processIds?.length; i += 1) {
    const processId = processIds[i];

    if (processId) {
      await killProcess(processId);
    }
  }

  const databases = Object.entries(process._databases || {});

  for (let i = 0; i < databases?.length; i += 1) {
    const [provider, providerConnection] = databases[i];

    if (providerConnection?.pid) {
      await killProcess(providerConnection.pid);
    }

    if (!providerConnection?.pid) {
      const providerConnections = Object.entries(providerConnection);

      for (let pc = 0; pc < providerConnections?.length; pc += 1) {
        const [_connectionName, connection] = providerConnections[pc];

        if (connection?.pid) {
          await killProcess(connection?.pid);
        }
      }
    }
  }
};

const getDatabaseProcessIds = () => {
  const databaseProcessIds = [];
  const databases = Object.entries(process._databases || {});

  for (let i = 0; i < databases?.length; i += 1) {
    const [_provider, providerConnection] = databases[i];

    if (providerConnection?.pid) {
      databaseProcessIds.push(providerConnection.pid);
    }

    if (!providerConnection?.pid) {
      const providerConnections = Object.entries(providerConnection);

      for (let pc = 0; pc < providerConnections?.length; pc += 1) {
        const [_connectionName, connection] = providerConnections[pc];

        if (connection?.pid) {
          databaseProcessIds.push(connection.pid);
        }
      }
    }
  }

  return databaseProcessIds;
};

const handleSignalEvents = (processIds = []) => {
  const execArgv = ["--no-warnings"];

  if (majorVersion < 19) {
    execArgv.push("--experimental-specifier-resolution=node");
  }

  const cleanupProcess = child_process.fork(
    path.resolve(`${__dirname}/cleanup/index.js`),
    [],
    {
      // NOTE: Run in detached mode so when parent process dies, the child still runs
      // and cleanup completes.
      detached: true,
      execArgv,
      // NOTE: Pipe stdin, stdout, and stderr. IPC establishes a message channel so we
      // communicate with the child_process.
      silent: true,
    }
  );

  process.on("SIGINT", async () => {
    const databaseProcessIds = getDatabaseProcessIds();
    cleanupProcess.send(JSON.stringify(({ processIds: [...processIds, ...databaseProcessIds] })));
    process.exit();
  });

  process.on("SIGTERM", async () => {
    const databaseProcessIds = getDatabaseProcessIds();
    cleanupProcess.send(JSON.stringify(({ processIds: [...processIds, ...databaseProcessIds] })));
    process.exit();
  });
};

const handleHMRProcessMessages = () => {
  process.hmrProcess.on("message", (message) => {
    const processMessages = [
      "server_closed",
      "HAS_HMR_CONNECTIONS",
      "HAS_NO_HMR_CONNECTIONS",
      "HMR_UPDATE_COMPLETED",
    ];

    if (!processMessages.includes(message)) {
      process.loader.stable(message);
    }

    if (message === "HAS_HMR_CONNECTIONS") {
      process.hmrProcess.hasConnections = true;
    }

    if (message === "HAS_NO_HMR_CONNECTIONS") {
      process.hmrProcess.hasConnections = false;
    }

    if (message === "HMR_UPDATE_COMPLETED") {
      // NOTE: Do a setTimeout to ensure that server is still available while the HMR update completes.
      // Necessary because some updates are instance, but others might mount a UI that needs a server
      // available (e.g., runs API requests).
      setTimeout(() => {
        restartApplicationProcess();
      }, 500);
    }
  });
};

const handleHMRProcessSTDIO = () => {
  try {
    if (process.hmrProcess) {
      process.hmrProcess.on("error", (error) => {
        CLILog(error.toString(), {
          level: "danger",
          docs: "https://github.com/cheatcode/joystick",
        });
      });

      process.hmrProcess.stdout.on("data", (data) => {
        console.log(data.toString());
      });

      process.hmrProcess.stderr.on("data", (data) => {
        process.loader.stop();
        CLILog(data.toString(), {
          level: "danger",
          docs: "https://github.com/cheatcode/joystick",
        });
      });
    }
  } catch (exception) {
    throw new Error(`[dev.handleHMRProcessSTDIO] ${exception.message}`);
  }
};

const startHMRProcess = () => {
  const execArgv = ["--no-warnings"];

  if (majorVersion < 19) {
    execArgv.push("--experimental-specifier-resolution=node");
  }

  const hmrProcess = child_process.fork(
    path.resolve(`${__dirname}/hmrServer.js`),
    [],
    {
      execArgv,
      // NOTE: Pipe stdin, stdout, and stderr. IPC establishes a message channel so we
      // communicate with the child_process.
      silent: true,
    }
  );

  process.hmrProcess = hmrProcess;

  handleHMRProcessSTDIO();
  handleHMRProcessMessages();
};

const notifyHMRClients = (indexHTMLChanged = false) => {
  const settings = loadSettings(process.env.NODE_ENV);
  process.hmrProcess.send(
    JSON.stringify({
      type: "RESTART_SERVER",
      settings,
      indexHTMLChanged,
    })
  );
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
          docs: "https://github.com/cheatcode/joystick",
        });
      });
    }
  } catch (exception) {
    throw new Error(`[dev.handleServerProcessSTDIO] ${exception.message}`);
  }
};

const startApplicationProcess = () => {
  const execArgv = ["--no-warnings"];

  if (majorVersion < 19) {
    execArgv.push("--experimental-specifier-resolution=node");
  }

  if (
    process.env.NODE_ENV === "development" &&
    process.env.IS_DEBUG_MODE === "true"
  ) {
    execArgv.push("--inspect");
  }

  const serverProcess = child_process.fork(
    path.resolve(".joystick/build/index.server.js"),
    [],
    {
      execArgv,
      // NOTE: Pipe stdin, stdout, and stderr. IPC establishes a message channel so we
      // communicate with the child_process.
      silent: true,
      env: {
        FORCE_COLOR: "1",
        LOGS_PATH: process.env.LOGS_PATH,
        NODE_ENV: process.env.NODE_ENV,
        ROOT_URL: process.env.ROOT_URL,
        PORT: process.env.PORT,
        JOYSTICK_SETTINGS: process.env.JOYSTICK_SETTINGS,
      },
    }
  );

  process.serverProcess = serverProcess;

  handleServerProcessSTDIO();
  handleServerProcessMessages();

  return serverProcess;
};

const restartApplicationProcess = async () => {
  if (process.serverProcess && process.serverProcess.pid) {
    process.loader.text("Restarting app...");
    process.serverProcess.kill();
    startApplicationProcess();
    return Promise.resolve();
  }

  // NOTE: Original process was never initialized due to an error.
  process.loader.text("Starting app...");
  startApplicationProcess();

  if (!process.hmrProcess) {
    startHMRProcess();
  }
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
  const fileResults = await buildFiles(
    filesToBuild,
    null,
    process.env.NODE_ENV
  );

  const hasErrors = [...fileResults]
    .filter((result) => !!result)
    .map(({ success }) => success)
    .includes(false);

  if (!hasErrors) {
    startApplicationProcess();
    startHMRProcess();
    // If the file has errors on startup, no way to trigger a restart w/o a watcher.
  }
};

const startWatcher = async (buildSettings = {}) => {
  await initialBuild(buildSettings);

  const watcher = chokidar.watch(
    watchlist.map(({ path }) => path),
    {
      ignoreInitial: true,
    }
  );

  watcher.on("all", async (event, path) => {
    await requiredFileCheck();
    process.loader.text("Rebuilding app...");
    const isHTMLUpdate = path?.includes("index.html");

    const isUIUpdate =
      (process.hmrProcess.hasConnections && path?.includes("ui/")) || false;

    if (
      ["addDir"].includes(event) &&
      fs.existsSync(path) &&
      fs.lstatSync(path).isDirectory() &&
      !fs.existsSync(`./.joystick/build/${path}`)
    ) {
      fs.mkdirSync(`./.joystick/build/${path}`);

      if (isUIUpdate) {
        notifyHMRClients(isHTMLUpdate);
      } else {
        restartApplicationProcess();
      }

      return;
    }

    if (!!filesToCopy.find((fileToCopy) => fileToCopy.path === path)) {
      const isDirectory = fs.statSync(path).isDirectory();

      if (isDirectory && !fs.existsSync(`./.joystick/build/${path}`)) {
        fs.mkdirSync(`./.joystick/build/${path}`);
      }

      if (!isDirectory) {
        fs.writeFileSync(`./.joystick/build/${path}`, fs.readFileSync(path));
      }

      loadSettings(process.env.NODE_ENV);

      if (isUIUpdate) {
        notifyHMRClients(isHTMLUpdate);
      } else {
        restartApplicationProcess();
      }

      return;
    }

    if (["add", "change"].includes(event) && fs.existsSync(path)) {
      const codependencies = getCodependenciesForFile(path);
      const fileResults = await buildFiles(
        [path, ...(codependencies?.existing || [])],
        null,
        process.env.NODE_ENV
      );
      const fileResultsHaveErrors = fileResults
        .filter((result) => !!result)
        .map(({ success }) => success)
        .includes(false);

      removeDeletedDependenciesFromMap(codependencies.deleted);

      const hasErrors = fileResultsHaveErrors;

      if (process.serverProcess && hasErrors) {
        process.serverProcess.send(
          JSON.stringify({
            error: "BUILD_ERROR",
            paths: fileResults
              .filter(({ success }) => !success)
              .map(({ path: pathWithError, error }) => ({
                path: pathWithError,
                error,
              })),
          })
        );

        return;
      }

      if (!hasErrors) {
        process.initialBuildComplete = true;

        if (isUIUpdate) {
          notifyHMRClients(isHTMLUpdate);
        } else {
          restartApplicationProcess();
        }

        return;
      }
    }

    if (
      ["unlink", "unlinkDir"].includes(event) &&
      !fs.existsSync(`./.joystick/build/${path}`)
    ) {
      if (isUIUpdate) {
        notifyHMRClients(isHTMLUpdate);
      } else {
        restartApplicationProcess();
      }

      return;
    }

    if (
      ["unlink", "unlinkDir"].includes(event) &&
      fs.existsSync(`./.joystick/build/${path}`)
    ) {
      const pathToUnlink = `./.joystick/build/${path}`;
      const stats = fs.lstatSync(pathToUnlink);

      if (stats.isDirectory()) {
        fs.rmdirSync(pathToUnlink, { recursive: true });
      }

      if (stats.isFile()) {
        fs.unlinkSync(pathToUnlink);
      }

      if (isUIUpdate) {
        notifyHMRClients(isHTMLUpdate);
      } else {
        restartApplicationProcess();
      }

      return;
    }
  });
};

const startDatabase = async (database = {}, databasePort = 2610, hasMultipleOfProvider = false) => {
  process._databases = {
    ...(process._databases || {}),
    [database.provider]: !hasMultipleOfProvider ? await startDatabaseProvider(database, databasePort) : {
      ...((process._databases && process._databases[database.provider]) || {}),
      [database?.name || `${database.provider}_${databasePort}`]: await startDatabaseProvider(database, databasePort)
    },
  };

  return Promise.resolve(process._databases);
};

const startDatabases = async (databasePortStart = 2610) => {
  try {
    const hasSettings = !!process.env.JOYSTICK_SETTINGS;
    const settings = hasSettings && JSON.parse(process.env.JOYSTICK_SETTINGS);
    const databases = settings?.config?.databases || [];

    if (databases && Array.isArray(databases) && databases.length > 0) {
      validateDatabasesFromSettings(databases);

      for (let i = 0; i < databases?.length; i += 1) {
        const database = databases[i];
        const hasMultipleOfProvider = (databases?.filter((database) => database?.provider === database?.provider))?.length > 1;

        // NOTE: Increment each database port using index in the databases array from settings.
        await startDatabase(database, databasePortStart + i, hasMultipleOfProvider);
      }

      return Promise.resolve();
    }

    return Promise.resolve();
  } catch (exception) {
    console.warn(exception);
  }
};

const loadSettings = () => {
  const environment = process.env.NODE_ENV;
  const settingsFilePath = `${process.cwd()}/settings.${environment}.json`;
  const hasSettingsFile = fs.existsSync(settingsFilePath);

  if (!hasSettingsFile) {
    CLILog(
      `A settings file could not be found for this environment (${environment}). Create a settings.${environment}.json file at the root of your project and restart Joystick.`,
      {
        level: "danger",
        docs: "https://github.com/cheatcode/joystick#settings",
      }
    );
    process.exit(0);
  }

  const rawSettingsFile = fs.readFileSync(settingsFilePath, "utf-8");
  const isValidJSON = isValidJSONString(rawSettingsFile);

  if (!isValidJSON) {
    CLILog(
      `Failed to parse settings file. Double-check the syntax in your settings.${environment}.json file at the root of your project and restart Joystick.`,
      {
        level: "danger",
        docs: "https://github.com/cheatcode/joystick#settings",
        tools: [{ title: "JSON Linter", url: "https://jsonlint.com/" }],
      }
    );
    process.exit(0);
  }

  const settingsFile = isValidJSON ? rawSettingsFile : "{}";

  // NOTE: Child process will inherit this env var from this parent process.
  process.env.JOYSTICK_SETTINGS = settingsFile;

  return JSON.parse(settingsFile);
};

const checkIfJoystickProject = () => {
  return fs.existsSync(`${process.cwd()}/.joystick`);
};

export default async (args = {}, options = {}) => {
  process.loader = new Loader({ defaultMessage: "Starting app..." });

  const port = options?.port ? parseInt(options?.port) : 2600;

  // NOTE: Give databases their own port range to avoid collisions.
  const databasePortStart = port + 10;

  const isJoystickProject = checkIfJoystickProject();

  if (!isJoystickProject) {
    CLILog(
      "This is not a Joystick project. A .joystick folder could not be found.",
      {
        level: "danger",
        docs: "https://github.com/cheatcode/joystick",
      }
    );
    process.exit(0);
  }

  await killPortProcess([port, port + 1]);

  process.title = "joystick";
  process.env.LOGS_PATH = options?.logs || null;
  process.env.NODE_ENV = options?.environment || "development";
  process.env.PORT = options?.port ? parseInt(options?.port) : 2600;
  process.env.IS_DEBUG_MODE = options?.debug;

  const settings = loadSettings(process.env.NODE_ENV);
  await startDatabases(databasePortStart);

  startWatcher(settings?.config?.build);
  handleSignalEvents([]);
};
