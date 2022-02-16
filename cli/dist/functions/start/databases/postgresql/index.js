import fs from "fs";
import chalk from "chalk";
import util from "util";
import commandExists from "command-exists";
import child_process from "child_process";
import { kill as killPortProcess } from "cross-port-killer";
import getProcessIdFromPort from "../../getProcessIdFromPort.js";
import CLILog from "../../../../lib/CLILog.js";
const exec = util.promisify(child_process.exec);
const getPostgreSQLProcessId = async (port = 2610) => {
  const pids = await getProcessIdFromPort(port);
  return pids.tcp && pids.tcp[0];
};
const warnPostgreSQLIsMissing = () => {
  CLILog("PostgreSQL is not installed on this computer. You can download PostgreSQL at https://www.postgresql.org/download. After you've installed PostgreSQL, run joystick start again, or, remove PostgreSQL from your databases list in your settings.development.json file to skip startup.", {
    level: "danger",
    docs: "https://cheatcode.co/docs/joystick/cli#databases"
  });
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
  const dataDirectoryExists = fs.existsSync(".joystick/data/postgresql");
  const postgreSQLControlExists = checkIfPostgreSQLControlExists();
  if (!postgreSQLControlExists) {
    CLILog("PostgreSQL is installed on this computer, but pg_ctl (what Joystick uses to start and manage PostgreSQL) is not in your command line's PATH variable. Add pg_ctl to your command line's PATH, restart your command line, and try again.", {
      level: "danger",
      docs: "https://cheatcode.co/docs/joystick/postgresql#path"
    });
  }
  if (!dataDirectoryExists && postgreSQLControlExists) {
    await exec(`pg_ctl init -D .joystick/data/postgresql`);
  }
  try {
    const postgreSQLPort = port;
    await killPortProcess(postgreSQLPort);
    const databaseProcess = child_process.spawn(`pg_ctl`, [
      "-o",
      `"-p ${postgreSQLPort}"`,
      "-D",
      ".joystick/data/postgresql",
      "start"
    ].filter((command) => !!command));
    return new Promise((resolve) => {
      databaseProcess.stdout.on("data", async (data) => {
        const stdout = data?.toString();
        if (stdout.includes("database system is ready to accept connections")) {
          const processId = await getPostgreSQLProcessId(postgreSQLPort);
          resolve(processId);
          return processId;
        }
      });
    });
  } catch (exception) {
    console.warn(exception);
    process.exit(1);
  }
};
var postgresql_default = async (port = 2610) => await startPostgreSQL(port);
export {
  postgresql_default as default
};
