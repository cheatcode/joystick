import child_process from "child_process";
import fs from "fs";
import os from "os";
import get_platform_safe_path from '../../../get_platform_safe_path.js';
import get_process_id_from_port from "../../../get_process_id_from_port.js";
import kill_port_process from "../../../kill_port_process.js";
import path_exists from "../../../path_exists.js";

const { mkdir } = fs.promises;

const get_redis_server_command = () => {
  return 'redis-server';
};

const start_redis_process = (redis_port = 2610) => {
  return new Promise((resolve) => {
    const redis_server_command = get_redis_server_command();
    const joystick_redis_path = `${os.homedir()}/.joystick/databases/redis/${redis_server_command}`;
    const database_process_flags = [
      '--port',
      redis_port,
      '--dir',
      get_platform_safe_path(`./.joystick/data/redis_${redis_port}`),
      '--save',
      '60',
      '1',
      '--loglevel',
      'warning',
    ];

    const database_process = child_process.spawn(
      joystick_redis_path,
      database_process_flags.filter((command) => !!command),
    );

    database_process.stdout.on('data', async (data) => {
      const stdout = data?.toString();

      if (stdout.includes('Ready to accept connections')) {
        const process_id = await get_process_id_from_port(redis_port);
        return resolve(parseInt(process_id, 10));
      }
    });

    database_process.stderr.on('data', async (data) => {
      const stderr = data.toString();
      console.log(stderr);
    });
  });
};

const setup_data_directory = async (redis_port = 2610) => {
  const data_directory_exists = await path_exists(`.joystick/data/redis_${redis_port}`);

  if (!data_directory_exists) {
    await mkdir(`.joystick/data/redis_${redis_port}`, { recursive: true });
  }

  return data_directory_exists;
};

const start_redis = async (redis_port = 2610) => {
  await setup_data_directory(redis_port);

  try {
    await kill_port_process(redis_port);
    const redis_process_id = await start_redis_process(redis_port);
    return redis_process_id;
  } catch (exception) {
    console.warn(exception);
    process.exit(1);
  }
};

export default start_redis;
