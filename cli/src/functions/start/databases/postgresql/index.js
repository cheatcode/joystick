import fs from "fs";
import chalk from "chalk";
import util from "util";
import commandExists from "command-exists";
import child_process, { execSync, spawn, spawnSync } from "child_process";
import { killPortProcess } from 'kill-port-process';
import isWindows from "../../isWindows.js";
import CLILog from "../../../../lib/CLILog.js";

const exec = util.promisify(child_process.exec);

const getPostgreSQLProcessId = (stdout = null) => {
  const regex = new RegExp(/\[\d+\]/g);
  const matches = stdout.match(regex);
  const processId = matches && matches[0] && matches[0].replace('[', '').replace(']', '');
  return parseInt(processId, 10);
};

const warnPostgreSQLIsMissing = () => {
  console.warn(`
  ${chalk.red("PostgreSQL is not installed on this computer.")}\n
  ${chalk.green(
    "Download PostgreSQL at https://www.postgresql.org/download/"
  )}
    After you've installed PostgreSQL, run joystick start again, or, remove PostgreSQL from your databases list in your settings.development.json file to skip startup.
  `);
};

const checkIfPostgreSQLExists = () => {
  return commandExists.sync("psql");
};

const checkIfPostgreSQLControlExists = () => {
  return commandExists.sync("pg_ctl");
};

const startPostgreSQL = async () => {
  const postgreSQLExists = checkIfPostgreSQLExists();

  if (!postgreSQLExists) {
    process.loader.stop();
    warnPostgreSQLIsMissing();
    process.exit(1);
  }

  /*
  TODO (MAC):

  1. Check if pg_ctl is installed.
  2. Check if .joystick/data/postgresql exists w/ PG_VERSION file.
  3. If it DOES NOT exist, run pg_ctl init -D .joystick/data/postgresql to create it.
  4. Once we have a data directory, start postgresql with pg_ctl -D .joystick/data/postgresql start 
*/

  const dataDirectoryExists = fs.existsSync(".joystick/data/postgresql");
  const postgreSQLControlExists = checkIfPostgreSQLControlExists();

  if (!dataDirectoryExists && postgreSQLControlExists) {
    await exec(
      `pg_ctl init -D .joystick/data/postgresql`
    );
  }

  try {
    const postgreSQLPort = parseInt(process.env.PORT, 10) + 1;
    // await killPortProcess(postgreSQLPort);

    // TODO: Windows.

    console.log('BEFORE START');

    const result = await execSync(
      `pg_ctl -D .joystick/data/postgresql start`,
      {
        stdio: 'inherit'
      }
    );

    console.log({ result });

    // const postgreSQLProcessId = getPostgreSQLProcessId(stdout);

    // return postgreSQLProcessId;

    return 0;
  } catch (exception) {
    console.warn(exception);
    process.exit(1);
  }
};

export default async (options = {}) => await startPostgreSQL(options);
