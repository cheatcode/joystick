import child_process from "child_process";
import fs from "fs";
import util from "util";
import os from "os";
import path from 'path';
import get_platform_safe_path from "../../../get_platform_safe_path.js";
import get_process_id_from_port from "../../../get_process_id_from_port.js";
import path_exists from "../../../path_exists.js";

const exec = util.promisify(child_process.exec);
const { rename, mkdir, readdir } = fs.promises;

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

  // NOTE: For Linux, we need to set granular permissions on the data directory path
  // to avoid access denied errors from the OS.
  if (process.platform === 'linux') {
    await exec(`sudo chmod 755 /root`);
    await exec(`sudo chmod 755 /root/${process.project_folder}`);
    await exec(`sudo chmod 755 /root/${process.project_folder}/.joystick`);
    await exec(`sudo chmod 700 /root/${process.project_folder}/.joystick/data/postgresql_${postgresql_port}`);
    await exec(`sudo chown -R postgres:postgres /root/${process.project_folder}/.joystick/data/postgresql_${postgresql_port}`);
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
    const joystick_postgresql_bin_path = `${os.homedir()}/.joystick/databases/postgresql/bin/bin`;

    const joystick_pg_ctl_command = get_pg_ctl_command();
    const joystick_initdb_command = get_initdb_command();
    const joystick_postgres_command = get_postgres_command();
    const joystick_createdb_command = get_createdb_command();
    
    const joystick_pg_ctl_path = `${joystick_postgresql_bin_path}/${joystick_pg_ctl_command}`;
    const joystick_initdb_path = `${joystick_postgresql_bin_path}/${joystick_initdb_command}`;
    const joystick_postgres_path = `${joystick_postgresql_bin_path}/${joystick_postgres_command}`;
    const joystick_createdb_path = `${joystick_postgresql_bin_path}/${joystick_createdb_command}`;

    const data_directory_exists = await setup_data_directory(port);

    if (data_directory_exists) {
      if (process.platform === 'linux') {
        await exec(`sudo -u postgres ./initdb -D ${process.cwd()}/.joystick/data/postgresql_${port} --no-locale`, {
          cwd: joystick_postgresql_bin_path
        });
      } else {
        await exec(`${joystick_initdb_path} -D .joystick/data/postgresql_${port} --options=--no-locale`);
      }
    }

    const existing_process_id = parseInt(await get_process_id_from_port(postgresql_port), 10);

    if (existing_process_id) {
      if (process.platform === 'linux') {
        await exec(`${joystick_pg_ctl_path} kill KILL ${existing_process_id}`);
      } else {
        await exec(`${joystick_pg_ctl_path} kill KILL ${existing_process_id}`);
      }
    }

    const database_process = process.platform === 'linux' ? child_process.spawn(
      'sudo',
      [
        '-u',
        'postgres',
        './postgres',
        `-p ${postgresql_port}`,
        '-D',
        get_platform_safe_path(`${process.cwd()}/.joystick/data/postgresql_${port}`),
        '-c log_destination=stderr -c logging_collector=off -c log_min_messages=WARNING',
      ],
      // `sudo -u postgres bash ./postgres`,
      // [
      //   `-p ${postgresql_port}`,
      //   '-D',
      //   get_platform_safe_path(`${process.cwd()}/.joystick/data/postgresql_${port}`),
      // ],
      { cwd: joystick_postgresql_bin_path, shell: '/bin/bash' }
    ) : child_process.spawn(
      joystick_postgres_path,
      [
        `-p ${postgresql_port}`,
        '-D',
        get_platform_safe_path(`.joystick/data/postgresql_${port}`),
      ],
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
          const createdb_command = process.platform === 'linux'
            ? `sudo -u postgres ${joystick_createdb_path} -h 127.0.0.1 -p ${postgresql_port} app`
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