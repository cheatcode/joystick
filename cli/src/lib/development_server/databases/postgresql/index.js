import child_process from "child_process";
import fs from "fs";
import util from "util";
import os from "os";
import path from "path";
import get_platform_safe_path from "../../../get_platform_safe_path.js";
import get_process_id_from_port from "../../../get_process_id_from_port.js";
import path_exists from "../../../path_exists.js";
import get_architecture from "../../../get_architecture.js";

const exec = util.promisify(child_process.exec);
const { rename } = fs.promises;


const setup_data_directory = async (postgresql_port = 2610) => {
  const legacy_data_directory_exists = await path_exists(".joystick/data/postgresql");
  let data_directory_exists = await path_exists(`.joystick/data/postgresql_${postgresql_port}`);

  if (legacy_data_directory_exists && !data_directory_exists) {
    await rename ('.joystick/data/postgresql', `.joystick/data/postgresql_${postgresql_port}`);
    data_directory_exists = true;
  }

  // Check if directory exists but is not properly initialized (missing PG_VERSION file)
  if (data_directory_exists) {
    const pg_version_exists = await path_exists(`.joystick/data/postgresql_${postgresql_port}/PG_VERSION`);
    if (!pg_version_exists) {
      data_directory_exists = false;
    }
  }

  return data_directory_exists;
};

const get_createdb_command = () => {
  return 'createdb';
};

const get_postgres_command = () => {
  return 'postgres';
};

const get_initdb_command = () => {
  return 'initdb';
};

const get_pg_ctl_command = () => {
  return 'pg_ctl';
};


const start_postgresql = async (port = 2610) => {
  try {
    const postgresql_port = port;
    const architecture = get_architecture();
    const joystick_postgresql_base_path = path.join(os.homedir(), '.joystick', 'databases', 'postgresql', architecture);
    const joystick_postgresql_bin_path = path.join(joystick_postgresql_base_path, 'bin');

    const joystick_pg_ctl_command = get_pg_ctl_command();
    const joystick_initdb_command = get_initdb_command();
    const joystick_postgres_command = get_postgres_command();
    const joystick_createdb_command = get_createdb_command();

    const is_root_on_linux = process.platform === 'linux' && process.getuid && process.getuid() === 0;

    const data_directory_exists = await setup_data_directory(port);

    if (!data_directory_exists) {
      if (is_root_on_linux) {
        // Create data directory and set ownership
        await exec(`mkdir -p ${process.cwd()}/.joystick/data/postgresql_${port}`);
        await exec(`chown -R postgres:postgres ${process.cwd()}/.joystick/data`);
        
        // Run initdb as postgres user with proper environment
        await exec(`sudo -u postgres ${joystick_postgresql_bin_path}/${joystick_initdb_command} -D ${process.cwd()}/.joystick/data/postgresql_${port} --auth-local=trust --auth-host=trust`);
      } else {
        await exec(`./${joystick_initdb_command} -D ${process.cwd()}/.joystick/data/postgresql_${port}`, {
          cwd: joystick_postgresql_bin_path
        });
      }
    }

    const existing_process_id = parseInt(await get_process_id_from_port(postgresql_port), 10);

    if (existing_process_id) {
      if (is_root_on_linux) {
        await exec(`sudo -u postgres ${joystick_postgresql_bin_path}/${joystick_pg_ctl_command} kill KILL ${existing_process_id}`);
      } else {
        await exec(`./${joystick_pg_ctl_command} kill KILL ${existing_process_id}`, {
          cwd: joystick_postgresql_bin_path
        });
      }
    }

    // Use pg_ctl to start PostgreSQL server
    const pg_ctl_command = is_root_on_linux
      ? `sudo -u postgres ${joystick_postgresql_bin_path}/${joystick_pg_ctl_command} -o "-p ${postgresql_port}" -D ${process.cwd()}/.joystick/data/postgresql_${port} start`
      : `./${joystick_pg_ctl_command} -o "-p ${postgresql_port}" -D ${process.cwd()}/.joystick/data/postgresql_${port} start`;

    const pg_ctl_options = is_root_on_linux ? {} : { cwd: joystick_postgresql_bin_path };

    await exec(pg_ctl_command, pg_ctl_options);

    // Wait a moment for the server to start
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get the PostgreSQL server process ID
    const process_id = (await get_process_id_from_port(postgresql_port))?.replace('\n', '');

    if (!process_id) {
      throw new Error('PostgreSQL server failed to start');
    }

    // Create the app database
    const createdb_command = is_root_on_linux
      ? `sudo -u postgres ${joystick_postgresql_bin_path}/${joystick_createdb_command} -h 127.0.0.1 -p ${postgresql_port} app`
      : `./${joystick_createdb_command} -h 127.0.0.1 -p ${postgresql_port} app`;

    try {
      await exec(createdb_command, {
        cwd: is_root_on_linux ? process.cwd() : joystick_postgresql_bin_path
      });
    } catch ({ stderr: error }) {
      if (!error || !error.includes('database "app" already exists')) {
        console.log(error);
      }
    }

    return parseInt(process_id, 10);
  } catch (exception) {
    console.warn(exception);
    process.exit(1);
  }
};

export default start_postgresql;
