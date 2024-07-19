import child_process from "child_process";
import fs from "fs";
import util from "util";
import os from "os";
import get_platform_safe_path from "../../../get_platform_safe_path.js";
import get_process_id_from_port from "../../../get_process_id_from_port.js";
import path_exists from "../../../path_exists.js";

const exec = util.promisify(child_process.exec);
const { rename, mkdir } = fs.promises;

const setup_data_directory = async (postgresql_port = 2610) => {
  const legacy_data_directory_exists = await path_exists(".joystick/data/postgresql");
  let data_directory_exists = await path_exists(`.joystick/data/postgresql_${postgresql_port}`);

  if (legacy_data_directory_exists && !data_directory_exists) {
    await rename('.joystick/data/postgresql', `.joystick/data/postgresql_${postgresql_port}`);
    data_directory_exists = true;
  }

  if (!data_directory_exists) {
    await mkdir(`.joystick/data/postgresql_${postgresql_port}`, { recursive: true });
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

const get_pg_ctl_command = () => {
  if (process.platform === 'win32') {
    return 'pg_ctl.exe';
  }

  return 'pg_ctl';
};

const start_postgresql = async (port = 2610) => {
  try {
    const joystick_pg_ctl_command = get_pg_ctl_command();
    const joystick_createdb_command = get_createdb_command();
    const joystick_postgresql_bin_path = `${os.homedir()}/.joystick/databases/postgresql/bin`;
    const joystick_pg_ctl_path = `${joystick_postgresql_bin_path}/bin/${joystick_pg_ctl_command}`;
    const joystick_createdb_path = `${joystick_postgresql_bin_path}/bin/${joystick_createdb_command}`;

    const data_directory_exists = await setup_data_directory(port);

    if (!data_directory_exists) {
      if (process.platform === 'linux') {
        // NOTE: For Linux, we expect a globally available PostgreSQL as we don't use binaries,
        // but instead use the official apt-get install.
        await exec(`initdb -D .joystick/data/postgresql_${port} --options=--no-locale`);
      } else {
        await exec(`${joystick_pg_ctl_path} initdb -D .joystick/data/postgresql_${port} --options=--no-locale`);
      }
    }

    const postgresql_port = port;
    const existing_process_id = parseInt(await get_process_id_from_port(postgresql_port), 10);

    if (existing_process_id) {
      if (process.platform === 'linux') {
        await exec(`pg_ctl kill KILL ${existing_process_id}`);
      } else {
        await exec(`${joystick_pg_ctl_path} kill KILL ${existing_process_id}`);
      }
    }

    const database_process = process.platform !== 'linux' ? child_process.spawn(
      joystick_pg_ctl_path,
      [
        '-o',
        `"-p ${postgresql_port}"`,
        '-D',
        get_platform_safe_path(`.joystick/data/postgresql_${port}`),
        'start',
      ],
    // NOTE: For Linux, we expect a globally available PostgreSQL as we don't use binaries,
    // but instead use the official apt-get install.
    ) : child_process.spawn(
      `pg_ctl`,
      [
        '-o',
        `"-p ${postgresql_port}"`,
        '-D',
        get_platform_safe_path(`.joystick/data/postgresql_${port}`),
        'start',
      ],      
    );

    return new Promise((resolve) => {
      database_process.stderr.on('data', async (data) => {
        const stderr = data?.toString();

        console.log(stderr);

        if (!stderr?.includes('another server might be running')) {
          console.warn(stderr);
        }
      });

      database_process.stdout.on('data', async (data) => {
        const stdout = data?.toString();
        
        console.log(stdout);

        if (stdout.includes('database system is ready to accept connections')) {
          const process_id = (await get_process_id_from_port(postgresql_port))?.replace('\n', '');

          // NOTE: For Linux, we expect a globally available PostgreSQL as we don't use binaries,
          // but instead use the official apt-get install.
          const createdb_command = process.platform === 'linux'
            ? `createdb -h 127.0.0.1 -p ${postgresql_port} app`
            : `${joystick_createdb_path} -h 127.0.0.1 -p ${postgresql_port} app`;

          exec(createdb_command).then(() => {
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
    });
  } catch (exception) {
    console.warn(exception);
    process.exit(1);
  }
};

export default start_postgresql;