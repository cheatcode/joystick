import fs from "fs";
import chalk from "chalk";
import util from "util";
import commandExists from "command-exists";
import child_process from "child_process";
import { kill as killPortProcess } from 'cross-port-killer';
import getProcessIdFromPort from "../../../getProcessIdFromPort.js";
import CLILog from "../../../CLILog.js";

const exec = util.promisify(child_process.exec);

const getPostgreSQLProcessId = async (port = 2610) => {
  const pids = await getProcessIdFromPort(port);
  return pids.tcp && pids.tcp[0];
};

const setupDataDirectory = (postgresqlPort = 2610) => {
  const legacyDataDirectoryExists = fs.existsSync(".joystick/data/postgresql");
  let dataDirectoryExists = fs.existsSync(`.joystick/data/postgresql_${postgresqlPort}`);

  if (legacyDataDirectoryExists && !dataDirectoryExists) {
    fs.renameSync('.joystick/data/postgresql', `.joystick/data/postgresql_${postgresqlPort}`);
    dataDirectoryExists = true;
  }

  return dataDirectoryExists;
};

const warnPostgreSQLIsMissing = () => {
  CLILog(
    'PostgreSQL is not installed on this computer. You can download PostgreSQL at https://www.postgresql.org/download. After you\'ve installed PostgreSQL, run joystick start again, or, remove PostgreSQL from your databases list in your settings.development.json file to skip startup.',
    {
      level: 'danger',
      docs: 'https://cheatcode.co/docs/joystick/cli#databases'
    }
  );
};

const checkIfPostgreSQLExists = () => {
  return commandExists.sync("psql");
};

const checkIfPostgreSQLControlExists = () => {
  return commandExists.sync("pg_ctl");
};

const startPostgreSQL = async (port = 2610) => {
  const postgreSQLExists = checkIfPostgreSQLExists();

  if (!postgreSQLExists) {
    process.loader.stop();
    warnPostgreSQLIsMissing();
    process.exit(1);
  }

  const postgreSQLControlExists = checkIfPostgreSQLControlExists();

  if (!postgreSQLControlExists) {
    CLILog(
      'PostgreSQL is installed on this computer, but pg_ctl (what Joystick uses to start and manage PostgreSQL) is not in your command line\'s PATH variable. Add pg_ctl to your command line\'s PATH, restart your command line, and try again.',
      {
        level: 'danger',
        docs: 'https://cheatcode.co/docs/joystick/postgresql#path'
      }
    );
  }

  try {
    const dataDirectoryExists = setupDataDirectory(port);

    if (!dataDirectoryExists && postgreSQLControlExists) {
      await exec(
        `pg_ctl init -D .joystick/data/postgresql_${port}`
      );
    }

    const postgreSQLPort = port;
    await killPortProcess(postgreSQLPort);

    const databaseProcess = child_process.spawn(
      `pg_ctl`,
      [
        '-o',
        `"-p ${postgreSQLPort}"`,
        '-D',
        `.joystick/data/postgresql_${port}`,
        'start',
      ].filter((command) => !!command),
    );

    return new Promise((resolve) => {
      databaseProcess.stderr.on('data', async (data) => {
        const stderr = data?.toString();
        console.warn(stderr);
      });

      databaseProcess.stdout.on('data', async (data) => {
        const stdout = data?.toString();
        if (stdout.includes('database system is ready to accept connections')) {
          const processId = await getPostgreSQLProcessId(postgreSQLPort);
          const createAppDatabaseProcess = child_process.exec(`createdb -h 127.0.0.1 -p ${postgreSQLPort} app`);

          createAppDatabaseProcess.stderr.on('data', (error) => {
            // NOTE: PostgreSQL does not have a clean way to create database if it doesn't exist. Use this as a hack
            // to get around the "already exists" error (if the database exists, it's not an issue).
            if (error && error.includes('database "app" already exists')) {
              resolve(processId);
            } else {
              console.log(error);
            }
          });

          createAppDatabaseProcess.stdout.on('data', () => {
            resolve(processId);
          });

          return processId;
        }
      });
    });
  } catch (exception) {
    console.warn(exception);
    process.exit(1);
  }
};

export default async (port = 2610) => await startPostgreSQL(port);
