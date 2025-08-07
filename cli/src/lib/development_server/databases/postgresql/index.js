import child_process from "child_process";
import fs from "fs";
import util from "util";
import os from "os";
import path from "path";
import get_platform_safe_path from "../../../get_platform_safe_path.js";
import get_process_id_from_port from "../../../get_process_id_from_port.js";
import path_exists from "../../../path_exists.js";

const exec = util.promisify(child_process.exec);
const { rename } = fs.promises;

const get_architecture = () => {
  const arch = os.arch();
  if (arch === 'arm64') return 'arm64';
  if (arch === 'x64') return 'x86_64';
  throw new Error(`Unsupported architecture: ${arch}`);
};

const get_postgresql_env = (pg_dir) => {
  const env = { ...process.env };
  
  if (process.platform === 'darwin') {
    env.DYLD_LIBRARY_PATH = path.join(pg_dir, 'lib');
  }
  
  return env;
};

const setup_data_directory = async (postgresql_port = 2610) => {
  const legacy_data_directory_exists = await path_exists(".joystick/data/postgresql");
  let data_directory_exists = await path_exists(`.joystick/data/postgresql_${postgresql_port}`);

  if (legacy_data_directory_exists && !data_directory_exists) {
    await rename ('.joystick/data/postgresql', `.joystick/data/postgresql_${postgresql_port}`);
    data_directory_exists = true;
  }

  return data_directory_exists;
};

const get_createdb_command = () => {
  if (process.platform === 'win32') {
    return 'createdb.exe';
  }

  return 'createdb';
};

const get_postgres_command = () => {
  if (process.platform === 'win32') {
    return 'postgres.exe';
  }

  return 'postgres';
};

const get_initdb_command = () => {
  if (process.platform === 'win32') {
    return 'initdb.exe';
  }

  return 'initdb';
};

const get_pg_ctl_command = () => {
  if (process.platform === 'win32') {
    return 'pgctl.exe';
  }

  return 'pgctl';
};

const start_postgresql = async (port = 2610) => {
  try {
    const postgresql_port = port;
    const architecture = get_architecture();
    const joystick_postgresql_bin_path = path.join(os.homedir(), '.joystick', 'databases', 'postgresql', architecture);

    const joystick_pg_ctl_command = get_pg_ctl_command();
    const joystick_initdb_command = get_initdb_command();
    const joystick_postgres_command = get_postgres_command();
    const joystick_createdb_command = get_createdb_command();
    
    const joystick_pg_ctl_path = path.join(joystick_postgresql_bin_path, 'bin', joystick_pg_ctl_command);
    const joystick_initdb_path = path.join(joystick_postgresql_bin_path, 'bin', joystick_initdb_command);
    const joystick_postgres_path = path.join(joystick_postgresql_bin_path, 'bin', joystick_postgres_command);
    const joystick_createdb_path = path.join(joystick_postgresql_bin_path, 'bin', joystick_createdb_command);

    const data_directory_exists = await setup_data_directory(port);

    if (!data_directory_exists) {
      await exec(`${joystick_initdb_path} -D .joystick/data/postgresql_${port} --no-locale`, {
        env: get_postgresql_env(joystick_postgresql_bin_path)
      });
    }

    const existing_process_id = parseInt(await get_process_id_from_port(postgresql_port), 10);

    if (existing_process_id) {
      await exec(`${joystick_pg_ctl_path} kill KILL ${existing_process_id}`, {
        env: get_postgresql_env(joystick_postgresql_bin_path)
      });
    }

    const database_process = child_process.spawn(
      joystick_postgres_path,
      [
        `-p ${postgresql_port}`,
        '-D',
        get_platform_safe_path(`.joystick/data/postgresql_${port}`),
      ],
      {
        env: get_postgresql_env(joystick_postgresql_bin_path)
      }
    );

    return new Promise((resolve) => {
      database_process.stderr.on('data', async (data) => {
        const stderr = data?.toString();

        if (stderr.includes('database system is ready to accept connections')) {
          const process_id = (await get_process_id_from_port(postgresql_port))?.replace('\n', '');
          const createdb_command = `${joystick_createdb_path} -h 127.0.0.1 -p ${postgresql_port} app`;

          exec(createdb_command, {
            env: get_postgresql_env(joystick_postgresql_bin_path)
          }).then(() => {
            resolve(parseInt(process_id, 10));
          }).catch(({ stderr: error }) => {
            if (error && error.includes('database "app" already exists')) {
              resolve(parseInt(process_id, 10));
            } else {
              console.log(error);
            }
          });
        }
      });

      database_process.stdout.on('data', async (data) => {
        // NOTE: PostgreSQL (16) appears to route all output to stderr(?!). Have this for posterity
        // sake and to avoid trapping useful information.
        const stdout = data?.toString();
        console.log(stdout);
      });
    });
  } catch (exception) {
    console.warn(exception);
    process.exit(1);
  }
};

export default start_postgresql;
