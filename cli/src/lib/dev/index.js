/* eslint-disable consistent-return */

import fs from 'fs';
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import child_process from "child_process";
import chokidar from "chokidar";
import CLILog from "../CLILog.js";
import loadSettings from "./loadSettings.js";
import Loader from "../loader.js";
import startDatabases from "./startDatabases.js";
import runTests from "./runTests.js";
import startHMR from "./startHMR.js";
import startApp from "./startApp.js";
import requiredFiles from "./requiredFiles.js";
import watchlist from "./watchlist.js";
import getFilesToBuild from "./getFilesToBuild.js";
import buildFiles from "../build/buildFiles.js";
import filesToCopy from "../filesToCopy.js";
import { SETTINGS_FILE_NAME_REGEX } from "../regexes.js";
import getCodependenciesForFile from "./getCodependenciesForFile.js";
import removeDeletedDependenciesFromMap from "../build/removeDeletedDependenciesFromMap.js";
import chalk from "chalk";
import checkIfPortOccupied from "../checkIfPortOccupied.js";
import {killPortProcess} from "kill-port-process";

const processIds = [];

const getDatabaseProcessIds = () => {
  try {
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
  } catch (exception) {
    throw new Error(`[dev.getDatabaseProcessIds] ${exception.message}`);
  }
};

const handleSignalEvents = (processIds = [], nodeMajorVersion = 0, __dirname = '') => {
  try {
    const execArgv = ["--no-warnings"];

    if (nodeMajorVersion < 19) {
      execArgv.push("--experimental-specifier-resolution=node");
    }

    const cleanupProcess = child_process.fork(
      path.resolve(`${__dirname}/cleanup.js`),
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

    process.cleanupProcess = cleanupProcess;

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
  } catch (exception) {
    throw new Error(`[dev.handleSignalEvents] ${exception.message}`);
  }
};

const handleHMRProcessMessages = (options = {}) => {
  try {
    process.hmrProcess.on("message", (message) => {
      const processMessages = [
        "SERVER_CLOSED",
        "HAS_HMR_CONNECTIONS",
        "HAS_NO_HMR_CONNECTIONS",
        "HMR_UPDATE_COMPLETED",
      ];

      if (!processMessages.includes(message?.type)) {
        process.loader.print(message);
      }

      if (message?.type === "HAS_HMR_CONNECTIONS") {
        process.hmrProcess.hasConnections = true;
      }

      if (message?.type === "HAS_NO_HMR_CONNECTIONS") {
        process.hmrProcess.hasConnections = false;
      }

      if (message?.type === "HMR_UPDATE_COMPLETED") {
        // NOTE: Do a setTimeout to ensure that server is still available while the HMR update completes.
        // Necessary because some updates are instant, but others might mount a UI that needs a server
        // available (e.g., runs API requests).
        setTimeout(() => {
          handleRestartApplicationProcess({
            ...options,
          });
        }, 500);
      }
    });
  } catch (exception) {
    throw new Error(`[dev.handleHMRProcessMessages] ${exception.message}`);
  }
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

const handleServerProcessMessages = () => {
  try {
    process.serverProcess.on("message", (message) => {
      const processMessages = ["SERVER_CLOSED"];

      if (!processMessages.includes(message)) {
        process.loader.print(message);
      }
    });
  } catch (exception) {
    throw new Error(`[dev.handleServerProcessMessages] ${exception.message}`);
  }
};

const handleServerProcessSTDIO = (options = {}) => {
  try {
    if (process.serverProcess) {
      process.serverProcess.on("error", (error) => {
        process.serverProcessLock = false;
        console.log(error);
      });

      process.serverProcess.stdout.on("data", (data) => {
        const message = data.toString();

        if (message && message.includes("App running at:") && !options?.watch) {
          process.loader.print(message);
          // NOTE: Clear the lock created by handleRestartApplicationProcess to mitigate
          // race conditions in back-to-back calls on rebuild.
          process.serverProcessLock = false;
          // NOTE: Clear the build error flag for the server process.
          process.server_process_has_build_error = false;
        } else {
          if (message && !message.includes("BUILD_ERROR")) {
            console.log(message);
          }
        }
      });

      process.serverProcess.stderr.on("data", (data) => {
        process.loader.stop();
        process.serverProcessLock = false;

        CLILog(data.toString(), {
          level: "danger",
          docs: "https://cheatcode.co/docs/joystick",
        });
      });
    }
  } catch (exception) {
    throw new Error(`[dev.handleServerProcessSTDIO] ${exception.message}`);
  }
};

const handleDeletePath = (context = {}, path = '', options = {}) => {
  try {
    if (context?.isDeletingPath) {
      if (context.isExistingPathInBuild) {
        const pathToUnlink = `./.joystick/build/${path}`;
        const stats = fs.lstatSync(pathToUnlink);

        if (stats.isDirectory()) {
          fs.rmdirSync(pathToUnlink, { recursive: true });
        }

        if (stats.isFile()) {
          fs.unlinkSync(pathToUnlink);
        }
      }

      if (context.isUIUpdate && !process.server_process_has_build_error) {
        handleNotifyHMRClients(context.isHTMLUpdate);
      } else {
        handleRestartApplicationProcess(options);
      }
    }
  } catch (exception) {
    throw new Error(`[dev.handleDeletePath] ${exception.message}`);
  }
};

const handleAddOrChangeFile = async (context = {}, path = '', options = {}) => {
  try {
    if (context.isAddingOrChangingFile) {
      const codependencies = await getCodependenciesForFile(path);
      const fileResults = await buildFiles({
        files: [path, ...(codependencies?.existing || [])],
        environment: process.env.NODE_ENV,
      });

      const fileResultsHaveErrors = fileResults
        .filter((result) => !!result)
        .map(({ success }) => success)
        .includes(false);

      removeDeletedDependenciesFromMap(codependencies.deleted);

      if (process.serverProcess && fileResultsHaveErrors) {
        // NOTE: Track whether or not we have a build error so that we can avoid
        // sending an HMR message to the client that it can't receive. Instead,
        // use this flag to fall back to a regular server restart as build errors
        // are corrected and rely on the below error page message to prompt the
        // developer to refresh the browser.
        process.server_process_has_build_error = true;

        // NOTE: If there's a build error while the app is running, relay it to
        // the app's server process to display an error page in the browser.
        process.serverProcess.send(
          JSON.stringify({
            type: "BUILD_ERROR",
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

      if (!fileResultsHaveErrors) {
        process.initialBuildComplete = true;

        if (context.isUIUpdate && !process.server_process_has_build_error) {
          handleNotifyHMRClients(context.isHTMLUpdate);
        } else {
          handleRestartApplicationProcess(options);
        }
      }
    }
  } catch (exception) {
    console.warn(exception);
    throw new Error(`[dev.handleAddOrChangeFile] ${exception.message}`);
  }
};

const handleAddDirectory = (context = {}, path = '', options = {}) => {
  try {
    if (context.isAddDirectory) {
      fs.mkdirSync(`./.joystick/build/${path}`);

      if (context.isUIUpdate && !process.server_process_has_build_error) {
        handleNotifyHMRClients(context.isHTMLUpdate);
      } else {
        handleRestartApplicationProcess(options);
      }
    }
  } catch (exception) {
    throw new Error(`[dev.handleAddDirectory] ${exception.message}`);
  }
};

const handleCopyFile = (context = {}, path = '', options = {}) => {
  try {
    if (context.isFileToCopy && !context.isDirectory) {
      fs.writeFileSync(`./.joystick/build/${path}`, fs.readFileSync(path));

      if (context.isUIUpdate && !process.server_process_has_build_error) {
        handleNotifyHMRClients(context.isHTMLUpdate);
      } else {
        handleRestartApplicationProcess(options);
      }
    }
  } catch (exception) {
    throw new Error(`[dev.handleCopyFile] ${exception.message}`);
  }
};

const handleCopyDirectory = (context = {}, path = '', options = {}) => {
  try {
    if (context.isFileToCopy && context.isDirectory && !context.isExistingPathInBuild) {
      fs.mkdirSync(`./.joystick/build/${path}`);

      if (context.isUIUpdate && !process.server_process_has_build_error) {
        handleNotifyHMRClients(context.isHTMLUpdate);
      } else {
        handleRestartApplicationProcess(options);
      }
    }
  } catch (exception) {
    throw new Error(`[dev.handleCopyDirectory] ${exception.message}`);
  }
};

const handleRestartApplicationProcess = async (options = {}) => {
  try {
    if (!process.serverProcessLock && process.serverProcess && process.serverProcess.pid) {
      process.serverProcess.kill('SIGINT');
    }

    // NOTE: When renaming files, a race condition can occur where multiple calls
    // to handleRestartApplicationProcess occur. To avoid port errors, put a lock
    // in place to prevent sequential calls attempting multiple server restarts.
    if (!process.serverProcessLock) {
      process.serverProcessLock = true;
      await handleStartAppServer(options);
    }

    return Promise.resolve();

    if (!process.hmrProcess) {
      startHMR();
    }
  } catch (exception) {
    throw new Error(`[dev.handleRestartApplicationProcess] ${exception.message}`);
  }
};

const handleStartAppServer = async (options = {}) => {
  try {
    const serverProcess = await startApp({
      watch: options?.watch,
      nodeMajorVersion: options?.nodeMajorVersion,
      port: options?.port,
    });

    if (serverProcess) {
      processIds.push(serverProcess.pid);
      process.serverProcess = serverProcess;
      handleServerProcessSTDIO(options);
      handleServerProcessMessages(options);
    }
  } catch (exception) {
    console.warn(exception);
    throw new Error(`[dev.handleStartAppServer] ${exception.message}`);
  }
};

const handleNotifyHMRClients = async (indexHTMLChanged = false) => {
  try {
    if (process.hmrProcess) {
      const databaseProcessIds = getDatabaseProcessIds();
      const settings = await loadSettings({
        environment: process.env.NODE_ENV,
        processIds: [...processIds, ...databaseProcessIds],
      });

      process.hmrProcess.send(
        JSON.stringify({
          type: "RESTART_SERVER",
          settings: settings.parsed,
          indexHTMLChanged,
        })
      );
    }
  } catch (exception) {
    console.warn(exception);
    throw new Error(`[dev.handleNotifyHMRClients] ${exception.message}`);
  }
};

const getWatchChangeContext = (event = '', path = '') => {
  try {
    const isHTMLUpdate = path === "index.html";
    const isUIPath = path?.includes("ui/") || path === 'index.css' || isHTMLUpdate;
    const isUIUpdate = (process.hmrProcess && process.hmrProcess.hasConnections && isUIPath) || false;
    const isSettingsUpdate = path?.match(SETTINGS_FILE_NAME_REGEX)?.length > 0;
    const pathExists = fs.existsSync(path);
    const isDirectory = pathExists && fs.statSync(path).isDirectory();
    const isFile = pathExists && fs.statSync(path).isFile();
    const isExistingPathInSource = isDirectory && pathExists;
    const isExistingPathInBuild = !!fs.existsSync(`./.joystick/build/${path}`);
    const isAddDirectory = event === 'addDir' && isExistingPathInSource && !isExistingPathInBuild;
    const isFileToCopy = !!filesToCopy.find((fileToCopy) => fileToCopy.path === path);
    const isExistingFileInSource = isFile && pathExists;
    const isAddingOrChangingFile = ["add", "change"].includes(event) && isExistingFileInSource;
    const isDeletingPath = ["unlink", "unlinkDir"].includes(event);

    return {
      pathExists,
      isHTMLUpdate,
      isUIPath,
      isUIUpdate,
      isSettingsUpdate,
      isDirectory,
      isFile,
      isExistingPathInSource,
      isExistingPathInBuild,
      isAddDirectory,
      isFileToCopy,
      isExistingFileInSource,
      isAddingOrChangingFile,
      isDeletingPath,
    };
  } catch (exception) {
    throw new Error(`[dev.getWatchChangeContext] ${exception.message}`);
  }
};

const startFileWatcher = (options = {}) => {
  try {
    const watcher = chokidar.watch(
      watchlist.map(({ path }) => path),
      { ignoreInitial: true }
    );

    watcher.on('all', async (event, path) => {
      // NOTE: Do this here in case a required file/folder goes missing inbetween builds.
      checkForRequiredFiles();

      const watchChangeContext = getWatchChangeContext(event, path);

      handleCopyDirectory(watchChangeContext, path, options);
      handleCopyFile(watchChangeContext, path, options);
      handleAddDirectory(watchChangeContext, path, options);

      await handleAddOrChangeFile(watchChangeContext, path, options);
      await handleDeletePath(watchChangeContext, path, options);

      if (watchChangeContext?.isSettingsUpdate) {
        const databaseProcessIds = getDatabaseProcessIds();
        await loadSettings({
          environment: options.environment,
          processIds: [...processIds, ...databaseProcessIds],
        });
      }
    });
  } catch (exception) {
    throw new Error(`[dev.startFileWatcher] ${exception.message}`);
  }
};

const runInitialBuild = async (buildSettings = {}) => {
  try {
    process.loader.print('Building app...');

    const filesToBuild = getFilesToBuild(buildSettings?.excludedPaths, "start");
    const fileResults = await buildFiles({
      files: filesToBuild,
      environment: process.env.NODE_ENV
    });

    const hasErrors = [...fileResults]
      .filter((result) => !!result)
      .map(({ success }) => success)
      .includes(false);

    // NOTE: If the initial build fails, exit the startup process.
    if (hasErrors) {
      console.log(chalk.redBright('Failed to start app. Correct the errors above and run joystick start again.\n'));
      process.exit(1);
    }
  } catch (exception) {
    console.warn(exception);
    throw new Error(`[dev.runInitialBuild] ${exception.message}`);
  }
};

const initProcess = (options = {}) => {
  try {
    process.title = options?.environment === 'test' ? "joystick_test" : 'joystick';
    process.loader = new Loader({
      defaultMessage: options?.environment === 'test' ? "Initializing test environment..." : "Starting app...",
    });

    process.env.LOGS_PATH = options?.logs || null;
    process.env.NODE_ENV = options?.environment || "development";
    process.env.PORT = options?.port ? parseInt(options?.port, 10) : 2600;
    process.env.IS_DEBUG_MODE = options?.debug;

  } catch (exception) {
    throw new Error(`[dev.initProcess] ${exception.message}`);
  }
};

const checkForRequiredFiles = () => {
  try {
    const missingFiles = [];

    for (let i = 0; i < requiredFiles?.length; i += 1) {
      const requiredFile = requiredFiles[i];
      const exists = fs.existsSync(`${process.cwd()}/${requiredFile.path}`);
      const stats = exists && fs.statSync(`${process.cwd()}/${requiredFile.path}`);

      if (requiredFile && requiredFile.type === "file" && (!exists || (exists && !stats.isFile()))) {
        missingFiles.push({ type: 'file', path: requiredFile.path });
      }

      if (requiredFile && requiredFile.type === "directory" && (!exists || (exists && !stats.isDirectory()))) {
        missingFiles.push({ type: 'directory', path: requiredFile.path });
      }
    }

    if (missingFiles?.length > 0) {
      const files = missingFiles?.filter((path) => path.type === 'file');
      const directories = missingFiles?.filter((path) => path.type === 'directory');

      let error = `The following paths are missing and required in a Joystick project:\n\n`;

      if (files?.length > 0) {
        error += `  > Required Files:\n\n`;

        for (let i = 0; i < files?.length; i += 1) {
          const file = files[i];
          error += `  /${file.path}\n`;
        }
      }

      if (directories?.length > 0) {
        error += `  > Required Directories:\n\n`;

        for (let i = 0; i < directories?.length; i += 1) {
          const file = directories[i];
          error += `  /${file.path}\n`;
        }
      }

      CLILog(error, {
        level: "danger",
        docs: "https://cheatcode.co/docs/joystick/structure",
      });

      process.exit(0);
    }
  } catch (exception) {
    throw new Error(`[dev.checkForRequiredFiles] ${exception.message}`);
  }
};

const warnInvalidJoystickEnvironment = () => {
  try {
    const hasJoystickFolder = fs.existsSync(`${process.cwd()}/.joystick`);
    const hasTestsFolder = fs.existsSync(`${process.cwd()}/tests`);

    if (process.env.NODE_ENV === 'test' && (!hasJoystickFolder || !hasTestsFolder)) {
      CLILog(
        "joystick test must be run in a directory with a .joystick folder and tests folder.",
        {
          level: "danger",
          docs: "https://cheatcode.co/docs/joystick/cli/test",
        }
      );

      process.exit(0);
    }

    if (process.env.NODE_ENV !== 'test' && !hasJoystickFolder) {
      CLILog(
        "joystick start must be run in a directory with a .joystick folder.",
        {
          level: "danger",
          docs: "https://cheatcode.co/docs/joystick/cli/start",
        }
      );

      process.exit(0);
    }
  } catch (exception) {
    throw new Error(`[dev.warnInvalidJoystickEnvironment] ${exception.message}`);
  }
};

const handleCleanup = () => {
  try {
    if (process.cleanupProcess) {
      const databaseProcessIds = getDatabaseProcessIds();
      process.cleanupProcess.send(JSON.stringify(({ processIds: [...processIds, ...databaseProcessIds] })));
    }
  } catch (exception) {
    throw new Error(`[actionName.handleCleanup] ${exception.message}`);
  }
};

const validateOptions = (options) => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.environment) throw new Error('options.environment is required.');
  } catch (exception) {
    throw new Error(`[dev.validateOptions] ${exception.message}`);
  }
};

const dev = async (options, { resolve, reject }) => {
  try {
    validateOptions(options);

    if (fs.existsSync('./.joystick/build')) {
      child_process.execSync(`rm -rf ./.joystick/build`);
    }

    const port = parseInt(options?.port || 2600, 10);
    const appPortOccupied = await checkIfPortOccupied(port);
    const hmrPortOccupied = await checkIfPortOccupied(port + 1);

    if (appPortOccupied) {
      CLILog(`Port ${options?.port} is already occupied. To start Joystick on this port, clear it and try again.`, {
        level: 'danger',
      });

      process.exit(0);
    }

    if (hmrPortOccupied) {
      await killPortProcess(port + 1);
    }

    initProcess(options);
    
    const nodeMajorVersion = parseInt(
      process?.version?.split(".")[0]?.replace("v", ""),
      10
    );

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    warnInvalidJoystickEnvironment();
    checkForRequiredFiles();

    const settings = await loadSettings({
      environment: options.environment,
    });

    await startDatabases({
      environment: options.environment,
      port: options.port,
      settings: settings.parsed
    });

    await runInitialBuild(settings?.parsed?.config?.build);
    await startFileWatcher({
      ...options,
      nodeMajorVersion,
    });

    await handleStartAppServer({
      ...options,
      nodeMajorVersion,
    });

    if (options?.environment !== 'test') {
      const hmrProcess = await startHMR({
        nodeMajorVersion,
        __dirname,
      });

      processIds.push(hmrProcess.pid);
      process.hmrProcess = hmrProcess;

      handleHMRProcessSTDIO();
      handleHMRProcessMessages({
        ...options,
        nodeMajorVersion,
      });
    }


    handleSignalEvents(
      processIds,
      nodeMajorVersion,
      __dirname
    );

    if (options?.environment === 'test') {
      process.loader.stop();
      const databaseProcessIds = getDatabaseProcessIds();

      await runTests({
        watch: options?.watch,
        __dirname,
        processIds: [
          ...processIds,
          ...databaseProcessIds,
        ],
        cleanupProcess: process.cleanupProcess,
      });

      if (!options?.watch) {
        // NOTE: Kick out of the process after tests run if we're not in watch mode.
        process.exit(0);
      }
    }
    
    resolve();
  } catch (exception) {
    console.warn(exception);
    reject(`[dev] ${exception.message}`);
  }
};

export default (options) =>
  new Promise((resolve, reject) => {
    dev(options, { resolve, reject });
  });
	