import child_process from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import get_platform_safe_path from '../../../get_platform_safe_path.js';
import get_process_id_from_port from "../../../get_process_id_from_port.js";
import kill_port_process from "../../../kill_port_process.js";
import path_exists from "../../../path_exists.js";
import get_architecture from "../../../get_architecture.js";

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
  return new Promise((resolve, reject) => {
    const mongo_server_command = get_mongo_server_command();
    const architecture = get_architecture();
    const joystick_mongodb_base_path = path.join(os.homedir(), '.joystick', 'databases', 'mongodb', architecture);
    const joystick_mongod_path = path.join(joystick_mongodb_base_path, 'bin', mongo_server_command);
    const database_process_flags = [
      '--port',
      mongodb_port,
      '--dbpath',
      get_platform_safe_path(`./.joystick/data/mongodb_${mongodb_port}`),
      '--quiet',
      '--replSet',
      `joystick_${mongodb_port}`,
    ];

    // Check if the MongoDB binary exists before trying to spawn it
    if (!fs.existsSync(joystick_mongod_path)) {
      return reject(new Error(`MongoDB binary not found at ${joystick_mongod_path}. Please ensure MongoDB is properly installed.`));
    }

    console.log(`Starting MongoDB with command: ${joystick_mongod_path}`);
    console.log(`MongoDB arguments:`, database_process_flags);
    console.log(`Architecture: ${architecture}`);
    console.log(`Base path: ${joystick_mongodb_base_path}`);
    console.log(`Command: ${mongo_server_command}`);
    console.log(`Full path exists: ${fs.existsSync(joystick_mongod_path)}`);

    const database_process = child_process.spawn(
      joystick_mongod_path,
      database_process_flags.filter((command) => !!command),
    );

    console.log(`Spawned process with PID: ${database_process.pid}`);

    // Add error handler for spawn failures
    database_process.on('error', (error) => {
      console.error(`Failed to start MongoDB process: ${error.message}`);
      console.error(`Binary path: ${joystick_mongod_path}`);
      console.error(`Error code: ${error.code}`);
      reject(error);
    });

    database_process.stdout.on('data', async (data) => {
      const stdout = data?.toString();

      if (stdout.includes('Waiting for connections')) {
        const mongo_shell_command = get_mongo_shell_command();
        const joystick_mongo_shell_path = path.join(joystick_mongodb_base_path, 'bin', mongo_shell_command);
        child_process.exec(`${joystick_mongo_shell_path} --eval "rs.initiate()" --verbose --port ${mongodb_port}`, async (error, _stdout, _stderr) => {
          if (error && !error?.message?.includes('already initialized')) {
            console.log(error);
          }

          const process_id = await get_process_id_from_port(mongodb_port);
          return resolve(parseInt(process_id, 10));
        });
      }
    });

    database_process.stderr.on('data', async (data) => {
      const stderr = data.toString();
      console.log(stderr);
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
