import child_process from "child_process";
import fs from "fs";
import os from "os";
import cli_log from "../../../cli_log.js";
import command_exists from '../../../command_exists.js';
import get_platform_safe_path from '../../../get_platform_safe_path.js';
import get_process_id_from_port from "../../../get_process_id_from_port.js";
import kill_port_process from "../../../kill_port_process.js";
import path_exists from "../../../path_exists.js";

const { rename, readdir, mkdir } = fs.promises;

const warn_mongodb_not_installed = () => {
  cli_log(
    ` MongoDB is not installed on this computer.\n\n Download MongoDB at https://www.mongodb.com/try/download/community\n\n After you've installed MongoDB, run joystick start again, or, remove MongoDB from your config.databases array in your settings.development.json file to skip starting it up.`,
    {
    	level: 'danger',
    	docs: 'https://github.com/cheatcode/joystick#databases',
  	}
  );
};

const check_if_mongodb_exists = async () => {
  if (process.platform === "win32") {
    const mongodb_versions = await get_mongodb_windows_versions();
    return mongodb_versions && mongodb_versions.length > 0;
  }

  return command_exists("mongod");
};

const get_mongodb_windows_versions = async () => {
  const mongodb_versions = (await readdir(`C:\\Program Files\\MongoDB\\Server\\`));
  return mongodb_versions;
};

const get_mongo_shell_command = () => {
  if (process.platform === 'win32') {
    return 'mongsh.exe';
  }

  return 'mongo';
};

const get_mongo_server_command = () => {
  if (process.platform === 'win32') {
    return 'mongod.exe';
  }

  return 'mongod';
};

const start_mongodb_process = (mongodb_port = 2610, mongodb_windows_versions = []) => {
  return new Promise((resolve) => {
    // TODO: Does this hold up on Windows + Linux?
    const mongo_server_command = get_mongo_server_command();
    const joystick_mongod_path = `${os.homedir()}/.joystick/databases/mongodb/bin/bin/${mongo_server_command}`;
    const database_process_flags = [
      '--port',
      mongodb_port,
      '--dbpath',
      get_platform_safe_path(`./.joystick/data/mongodb_${mongodb_port}`),
      '--quiet',
      // '--replSet',
      // `joystick_${mongodb_port}`,
    ];

    const database_process = child_process.spawn(
      joystick_mongod_path,
      database_process_flags.filter((command) => !!command),
    );

    database_process.stdout.on('data', async (data) => {
      const stdout = data?.toString();

      if (stdout.includes('Waiting for connections')) {
        const mongo_shell_command = get_mongo_shell_command();
        const joystick_mongo_path = `${os.homedir()}/.joystick/databases/mongodb/bin/bin/${mongo_shell_command}`;
        child_process.exec(`${joystick_mongo_path} --eval "rs.initiate()" --verbose --port ${mongodb_port}`, async (error, _stdout, stderr) => {
          console.log({
            error,
            _stdout,
            stderr,
          });
          const process_id = await get_process_id_from_port(mongodb_port);
          return resolve(parseInt(process_id, 10));
        });
      }
    });
  });
};

const setup_data_directory = async (mongodb_port = 2610) => {
  // NOTE: MongoDB was originally started as a standalone server. To enable additional functionality,
  // we moved to a replica set config which necessitated multiple data directories in order to support
  // running the same app on multiple ports (a limitation of MongoDB).
  const legacy_data_directory_exists = await path_exists(".joystick/data/mongodb");
  const data_directory_exists = await path_exists(`.joystick/data/mongodb_${mongodb_port}`);

  if (legacy_data_directory_exists && !data_directory_exists) {
    await rename('.joystick/data/mongodb', `.joystick/data/mongodb_${mongodb_port}`);
  }

  if (!data_directory_exists) {
    await mkdir(`.joystick/data/mongodb_${mongodb_port}`, { recursive: true });
  }

  return data_directory_exists;
};

const start_mongodb = async (mongodb_port = 2610) => {
  // const mongodb_exists = await check_if_mongodb_exists();
  const mongodb_windows_versions = process.platform === 'win32' ? await get_mongodb_windows_versions() : null;

  // if (!mongodb_exists) {
  //   warn_mongodb_not_installed();
  //   process.exit(1);
  // }

  await setup_data_directory(mongodb_port);

  try {
    await kill_port_process(mongodb_port);
    const mongo_process_id = await start_mongodb_process(mongodb_port, mongodb_windows_versions);
    return mongo_process_id;
  } catch (exception) {
    console.warn(exception);
    process.exit(1);
  }
};

export default start_mongodb;
