import fs from "fs";
import chalk from "chalk";
import util from "util";
import commandExists from "command-exists";
import child_process, { execSync, spawn, spawnSync } from "child_process";
import { kill as killPortProcess } from "cross-port-killer";
import isWindows from "../../isWindows.js";
import CLILog from "../../../../lib/CLILog.js";
const exec = util.promisify(child_process.exec);
const getPostgreSQLProcessId = (stdout = null) => {
  const regex = new RegExp(/\[\d+\]/g);
  const matches = stdout.match(regex);
  const processId = matches && matches[0] && matches[0].replace("[", "").replace("]", "");
  return parseInt(processId, 10);
};
const warnPostgreSQLIsMissing = () => {
  console.warn(`
  ${chalk.red("PostgreSQL is not installed on this computer.")}

  ${chalk.green("Download PostgreSQL at https://www.postgresql.org/download/")}
    After you've installed PostgreSQL, run joystick start again, or, remove PostgreSQL from your databases list in your settings.development.json file to skip startup.
  `);
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
  if (!dataDirectoryExists && postgreSQLControlExists) {
    await exec(`pg_ctl init -D .joystick/data/postgresql`);
  }
  try {
    const postgreSQLPort = port;
    console.log("BEFORE START");
    const result = await execSync(`pg_ctl -D .joystick/data/postgresql start`, {
      stdio: "inherit"
    });
    console.log({ result });
    return 0;
  } catch (exception) {
    console.warn(exception);
    process.exit(1);
  }
};
var postgresql_default = async (port = 2610) => await startPostgreSQL(port);
export {
  postgresql_default as default
};
