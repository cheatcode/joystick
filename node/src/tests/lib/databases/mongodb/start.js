import fs from 'fs';
import { execSync } from 'child_process';
import os from "os";

const isWindows = os.platform() === "win32";

const getMongoProcessId = (stdout = null) => {
  const forkedProcessId = stdout && stdout.match(/forked process:+\s[0-9]+/gi);
  const processId =
    forkedProcessId &&
    forkedProcessId[0] &&
    forkedProcessId[0].replace("forked process: ", "");

  return processId && parseInt(processId, 10);
};

export default async () => {
  const dataDirectoryExists = fs.existsSync("tests/.data/mongodb");

  if (!dataDirectoryExists) {
    fs.mkdirSync("tests/.data/mongodb", { recursive: true });
  }

  if (isWindows) {
    const currentPath = process.cwd();
    const mongodbVersions = fs
      .readdirSync(`C:\\Program Files\\MongoDB\\Server\\`)
      .sort()
      .reverse();
    const latestMongodbVersion = mongodbVersions && mongodbVersions[0];

    if (isWindows && mongodbVersions && mongodbVersions.length === 0) {
      console.log(
        chalk.red(
          "Couldn't find any MongoDB versions in C:\\Program Files\\MongoDB\\Server. Please double-check your MongoDB installation or re-install MongoDB and try again.\n"
        )
      );
      process.exit(1);
      return;
    }

    const mongodbWindowsCommand = `C:\\Program Files\\MongoDB\\Server\\${latestMongodbVersion}\\bin\\mongod`;
    spawn(mongodbWindowsCommand, [
      "--dbpath",
      `${currentPath}/.data/mongodb`,
      "--quiet",
    ]);

    return true;
  }

  const result = execSync(
    `mongod --port ${parseInt(process.env.PORT, 10) + 1} --dbpath ./tests/.data/mongodb --quiet --fork --logpath ./tests/.data/mongodb/log`
  );

  const stdout = result.toString();

  return getMongoProcessId(stdout);
};
