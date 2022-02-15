import fs from "fs";
import chalk from "chalk";
import util from "util";
import commandExists from "command-exists";
import child_process, { spawn, spawnSync } from "child_process";
import { kill as killPortProcess } from 'cross-port-killer';
import isWindows from "../../isWindows.js";
import CLILog from "../../../../lib/CLILog.js";
import getProcessIdFromPort from "../../getProcessIdFromPort.js";

const exec = util.promisify(child_process.exec);

const getMongoProcessId = async (port = 2601) => {
  const pids = await getProcessIdFromPort(port);
  return pids.tcp && pids.tcp[0];
};

const warnMongoDBMissing = () => {
  console.warn(`
  ${chalk.red("MongoDB is not installed on this computer.")}\n
  ${chalk.green(
    "Download MongoDB at https://www.mongodb.com/try/download/community"
  )}
    After you've installed MongoDB, run joystick start again, or, remove MongoDB from your databases list in your settings.development.json file to skip startup.
  `);
};

const checkIfMongoDBExists = () => {
  return commandExists.sync("mongod");
};

const startMongoDB = async () => {
  const mongodbExists = checkIfMongoDBExists();

  if (!mongodbExists) {
    process.loader.stop();
    warnMongoDBMissing();
    process.exit(1);
  }

  const dataDirectoryExists = fs.existsSync(".joystick/data/mongodb");

  if (!dataDirectoryExists) {
    fs.mkdirSync(".joystick/data/mongodb", { recursive: true });
  }

  try {
    const mongodbPort = parseInt(process.env.PORT, 10) + 1;
    await killPortProcess(mongodbPort);

    if (isWindows) {
      const mongodbVersions = fs
        .readdirSync(`C:\\Program Files\\MongoDB\\Server\\`)
        .sort()
        .reverse();

      if (mongodbVersions && mongodbVersions.length === 0) {
        CLILog(
          `Couldn't find any MongoDB versions in C:\\Program Files\\MongoDB\\Server. Please double-check your MongoDB installation or re-install MongoDB and try again.`, {
          level: 'danger',
          docs: 'https://github.com/cheatcode/joystick#databases',
        });
        process.exit(1);
        return;
      }
    }

    const databaseProcess = child_process.spawn(
      `mongod`,
      [
        '--port',
        mongodbPort,
        '--dbpath',
        './.joystick/data/mongodb',
        '--quiet',
        isWindows ? '' : '--fork'
      ].filter((command) => !!command),
    );

    return new Promise((resolve) => {
      databaseProcess.stdout.on('data', async (data) => {
        const stdout = data?.toString();
        if (stdout.includes('Waiting for connections')) {
          const processId = await getMongoProcessId(mongodbPort);
          resolve(processId);
          return processId;
        }
      });
    })
  } catch (exception) {
    console.warn(exception);
    process.exit(1);
  }
};

export default async (options = {}) => await startMongoDB(options);
