import child_process from "child_process";
import fs from "fs";
import os from "os";
import get_platform_safe_path from '../../../get_platform_safe_path.js';
import get_process_id_from_port from "../../../get_process_id_from_port.js";
import kill_port_process from "../../../kill_port_process.js";
import path_exists from "../../../path_exists.js";

const { rename, mkdir } = fs.promises;

const get_mongo_shell_command = () => {
  if (process.platform === 'win32') {
    return 'mongosh.exe';
  }

  return 'mongosh';
};

const get_mongo_server_command = () => {
  if (process.platform === 'win32') {
    return 'mongod.exe';
  }

  return 'mongod';
};

const start_mongodb_process = (mongodb_port = 2610) => {
  return new Promise((resolve) => {
    // TODO: Does this hold up on Linux?
    const mongo_server_command = get_mongo_server_command();
    const joystick_mongod_path = `${os.homedir()}/.joystick/databases/mongodb/bin/bin/${mongo_server_command}`;
    const database_process_flags = [
      '--port',
      mongodb_port,
      '--dbpath',
      get_platform_safe_path(`./.joystick/data/mongodb_${mongodb_port}`),
      // '--quiet',
      '--replSet',
      `joystick_${mongodb_port}`,
    ];

    const database_process = child_process.spawn(
      joystick_mongod_path,
      database_process_flags.filter((command) => !!command),
    );

    database_process.stdout.on('data', async (data) => {
      const stdout = data?.toString();

      if (stdout.includes('Waiting for connections')) {
        const mongo_shell_command = get_mongo_shell_command();
        const joystick_mongo_shell_path = `${os.homedir()}/.joystick/databases/mongodb/bin/bin/${mongo_shell_command}`;
        child_process.exec(`${joystick_mongo_shell_path} --eval "rs.initiate()" --verbose --port ${mongodb_port}`, async (error, _stdout, _stderr) => {
          if (error && !error?.message?.includes('already initialized')) {
            console.log(error);
          }

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
  await setup_data_directory(mongodb_port);

  try {
    await kill_port_process(mongodb_port);
    const mongo_process_id = await start_mongodb_process(mongodb_port);
    return mongo_process_id;
  } catch (exception) {
    console.warn(exception);
    process.exit(1);
  }
};

export default start_mongodb;
