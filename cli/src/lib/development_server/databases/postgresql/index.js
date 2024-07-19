import child_process from "child_process";
import fs from "fs";
import util from "util";
import os from "os";
import get_platform_safe_path from "../../../get_platform_safe_path.js";
import get_process_id_from_port from "../../../get_process_id_from_port.js";
import path_exists from "../../../path_exists.js";

const exec = util.promisify(child_process.exec);
const { rename } = fs.promises;

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
    const data_directory_exists = await setup_data_directory(port);

    // NOTE: Linux gets a bit messy for startup as we can't run pg_ctl as root on a machine. Instead
    // we have to use the joystick user we created during install via sudo (which requires some workarounds).
    
    const pg_ctl_command = os.platform() === 'linux' ?
      `cd ${joystick_postgresql_bin_path}/bin && sudo -u joystick ./pg_ctl` :
      `${joystick_postgresql_bin_path}/bin/${joystick_pg_ctl_command}`;

    const createdb_command = os.platform() === 'linux' ?
      `cd ${joystick_postgresql_bin_path}/bin && sudo -u joystick ./createdb` :
      `${joystick_postgresql_bin_path}/bin/${joystick_createdb_command}`;

    if (!data_directory_exists) {
      await exec(
        `${pg_ctl_command} init -D .joystick/data/postgresql_${port} --options=--no-locale`
      );
    }

    const postgresql_port = port;
    const existing_process_id = parseInt(await get_process_id_from_port(postgresql_port), 10);

    if (existing_process_id) {
      await exec(`${pg_ctl_command} kill KILL ${existing_process_id}`);
    }

    const database_process = child_process.spawn(
      `${pg_ctl_command}`,
      [
        '-o',
        `"-p ${postgresql_port}"`,
        '-D',
        get_platform_safe_path(`.joystick/data/postgresql_${port}`),
        'start',
      ].filter((command) => !!command),
    );

    return new Promise((resolve) => {
      database_process.stderr.on('data', async (data) => {
        const stderr = data?.toString();

        if (!stderr?.includes('another server might be running')) {
          console.warn(stderr);
        }
      });

      database_process.stdout.on('data', async (data) => {
        const stdout = data?.toString();

        if (stdout.includes('database system is ready to accept connections')) {
          const process_id = (await get_process_id_from_port(postgresql_port))?.replace('\n', '');

          exec(`${createdb_command} -h 127.0.0.1 -p ${postgresql_port} app`).then((data) => {
            resolve(parseInt(process_id, 10));
          }).catch(({ stderr: error }) => {
            // NOTE: PostgreSQL does not have a clean way to create database if it doesn't exist. Use this as a hack
            // to get around the "already exists" error (if the database exists, it's not an issue).
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
