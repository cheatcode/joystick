import child_process from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import get_platform_safe_path from '../../../get_platform_safe_path.js';
import get_process_id_from_port from "../../../get_process_id_from_port.js";
import kill_port_process from "../../../kill_port_process.js";
import path_exists from "../../../path_exists.js";
import get_architecture from "../../../get_architecture.js";

const { mkdir } = fs.promises;

const get_redis_server_command = () => {
  return 'redis-server';
};

const start_redis_process = (redis_port = 2610) => {
  return new Promise((resolve, reject) => {
    const redis_server_command = get_redis_server_command();
    const architecture = get_architecture();
    const joystick_redis_base_path = path.join(os.homedir(), '.joystick', 'databases', 'redis', architecture);
    const joystick_redis_path = path.join(joystick_redis_base_path, redis_server_command);
    const database_process_flags = [
      '--port',
      redis_port,
      '--dir',
      get_platform_safe_path(`./.joystick/data/redis_${redis_port}`),
      '--save',
      '60',
      '1',
      '--loglevel',
      'notice',
    ];

    const database_process = child_process.spawn(
      joystick_redis_path,
      database_process_flags.filter((command) => !!command),
    );

    // Set a timeout to prevent hanging
    const timeout = setTimeout(() => {
      reject(new Error('Redis startup timed out after 30 seconds'));
    }, 30000);

    let startup_detected = false;

    const check_if_ready = async () => {
      // Wait a moment for Redis to fully start
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      try {
        const process_id = await get_process_id_from_port(redis_port);
        if (process_id) {
          clearTimeout(timeout);
          return resolve(parseInt(process_id, 10));
        }
      } catch (error) {
        // Port not ready yet, will retry
      }
    };

    database_process.stdout.on('data', async (data) => {
      const stdout = data?.toString();
      
      // Don't log warnings, but still use output for startup detection
      if (!stdout.includes('WARNING') && !stdout.includes('# WARNING')) {
        // Only log non-warning messages if needed for debugging
        // console.log('Redis stdout:', stdout);
      }
      
      // If we see any Redis output and haven't started checking yet, start checking
      if (!startup_detected && stdout.trim()) {
        startup_detected = true;
        await check_if_ready();
      }
    });

    database_process.stderr.on('data', async (data) => {
      const stderr = data.toString();
      
      // Check for critical Redis errors that users should know about
      if (stderr.includes('FATAL') || stderr.includes('Can\'t open') || stderr.includes('Permission denied')) {
        clearTimeout(timeout);
        reject(new Error(`Redis startup failed: ${stderr.trim()}`));
        return;
      }
      
      // Don't log warnings, but still use output for startup detection
      if (!stderr.includes('WARNING') && !stderr.includes('# WARNING')) {
        // Only log non-warning messages if needed for debugging
        // console.log('Redis stderr:', stderr);
      }
      
      // If we see any Redis output and haven't started checking yet, start checking
      if (!startup_detected && stderr.trim()) {
        startup_detected = true;
        await check_if_ready();
      }
    });

    database_process.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    database_process.on('exit', (code) => {
      if (code !== 0) {
        clearTimeout(timeout);
        reject(new Error(`Redis process exited with code ${code}`));
      }
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
