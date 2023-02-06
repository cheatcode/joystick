import fs from "fs";
import commandExists from "command-exists";
import child_process from "child_process";
import { kill as killPortProcess } from 'cross-port-killer';
import isWindows from "../../isWindows.js";
import CLILog from "../../../../lib/CLILog.js";
import getProcessIdFromPort from "../../getProcessIdFromPort.js";

const getMongoProcessId = async (port = 2601) => {
  const pids = await getProcessIdFromPort(port);
  return pids.tcp && pids.tcp[0];
};

const warnMongoDBMissing = () => {
  CLILog(
    `MongoDB is not installed on this computer.\n\n Download MongoDB at https://www.mongodb.com/try/download/community\n\n After you've installed MongoDB, run joystick start again, or, remove MongoDB from your config.databases array in your settings.development.json file to skip starting it up.`, {
    level: 'danger',
    docs: 'https://github.com/cheatcode/joystick#databases',
  });
};

const checkIfMongoDBExists = () => {
  if (isWindows) {
    const mongodbVersions = fs
      .readdirSync(`C:\\Program Files\\MongoDB\\Server\\`)
      .sort()
      .reverse();

    return mongodbVersions && mongodbVersions.length > 0;
  }

  return commandExists.sync("mongod");
};

const startMongoDBProcess = (mongodbPort = 2610, dataDirectoryExists = false, resolveAfterRestart = null) => {
  return new Promise((resolve) => {
    console.log("START");
    const databaseProcessFlags = [
      '--port',
      mongodbPort,
      '--dbpath',
      `./.joystick/data/mongodb_${mongodbPort}`,
      '--quiet',
      '--replSet',
      `joystick_${mongodbPort}`,
    ];

    const databaseProcess = child_process.spawn(
      `mongod`,
      databaseProcessFlags.filter((command) => !!command),
    );

    databaseProcess.stdout.on('data', async (data) => {
      const stdout = data?.toString();

      if (stdout.includes('Waiting for connections')) {
        child_process.exec(`mongo --eval "rs.initiate()" --verbose --port ${mongodbPort}`, async (error, stdout, stderr) => {
          if (error || stderr) {
            console.warn(error || stderr);
          } else {
            const processId = await getMongoProcessId(mongodbPort);
            return resolve(processId);
          }
        });
      }
    });
  });
};

const setupDataDirectory = (mongodbPort = 2610) => {
  // NOTE: MongoDB was originally started as a standalone server. To enable additional functionality,
  // we moved to a replica set config which necessitated multiple data directories in order to support
  // running the same app on multiple ports (a limitation of MongoDB).
  const legacyDataDirectoryExists = fs.existsSync(".joystick/data/mongodb");
  const dataDirectoryExists = fs.existsSync(`.joystick/data/mongodb_${mongodbPort}`);

  if (legacyDataDirectoryExists && !dataDirectoryExists) {
    fs.renameSync('.joystick/data/mongodb', `.joystick/data/mongodb_${mongodbPort}`);
  }

  if (!dataDirectoryExists) {
    fs.mkdirSync(`.joystick/data/mongodb_${mongodbPort}`, { recursive: true });
  }

  return dataDirectoryExists;
};

const startMongoDB = async (mongodbPort = 2610) => {
  const mongodbExists = checkIfMongoDBExists();

  if (!mongodbExists) {
    process.loader.stop();
    warnMongoDBMissing();
    process.exit(1);
  }

  const dataDirectoryExists = setupDataDirectory(mongodbPort);

  try {
    await killPortProcess(mongodbPort);
    const mongodbProcessId = await startMongoDBProcess(mongodbPort, dataDirectoryExists);
    return mongodbProcessId;
  } catch (exception) {
    console.warn(exception);
    process.exit(1);
  }
};

export default async (port = 2610) => await startMongoDB(port);
