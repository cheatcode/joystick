import child_process from "child_process";
import fs from "fs";
import util from "util";
import os from "os";
import get_platform_safe_path from "../../../get_platform_safe_path.js";
import get_process_id_from_port from "../../../get_process_id_from_port.js";
import path_exists from "../../../path_exists.js";

const exec = util.promisify(child_process.exec);
const { rename, mkdir } = fs.promises;

const get_postgres_uid_gid = async () => {
  if (process.platform !== 'linux') return {};
  
  const { stdout: uid } = await exec("id -u postgres");
  const { stdout: gid } = await exec("id -g postgres");
  return { uid: parseInt(uid), gid: parseInt(gid) };
};

const set_pg_permissions = async (bin_path) => {
  if (process.platform !== 'linux') return;

  try {
    await exec(`sudo chown -R postgres:postgres ${bin_path}`);
    await exec(`sudo chmod -R 755 ${bin_path}`);
  } catch (error) {
    console.error('Error setting PostgreSQL permissions:', error);
    throw error;
  }
};

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

  // Set permissions for the data directory only on Linux
  if (process.platform === 'linux') {
    try {
      await exec(`sudo chown postgres:postgres .joystick/data/postgresql_${postgresql_port}`);
      await exec(`sudo chmod 700 .joystick/data/postgresql_${postgresql_port}`);
    } catch (error) {
      console.error('Error setting permissions for data directory:', error);
      throw error;
    }
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

    // Set correct permissions for PostgreSQL binaries
    await set_pg_permissions(joystick_postgresql_bin_path);

    const data_directory_exists = await setup_data_directory(port);

    if (!data_directory_exists) {
      if (process.platform === 'linux') {
        await exec(`sudo -u postgres ${joystick_pg_ctl_path} init -D .joystick/data/postgresql_${port} --options=--no-locale`);
      } else {
        await exec(`${joystick_pg_ctl_path} init -D .joystick/data/postgresql_${port} --options=--no-locale`);
      }
    }

    const postgresql_port = port;
    const existing_process_id = parseInt(await get_process_id_from_port(postgresql_port), 10);

    if (existing_process_id) {
      if (process.platform === 'linux') {
        await exec(`sudo -u postgres ${joystick_pg_ctl_path} kill KILL ${existing_process_id}`);
      } else {
        await exec(`${joystick_pg_ctl_path} kill KILL ${existing_process_id}`);
      }
    }

    const { uid, gid } = await get_postgres_uid_gid();

    const database_process = process.platform !== 'linux' ? child_process.spawn(
      joystick_pg_ctl_path,
      [
        '-o',
        `"-p ${postgresql_port}"`,
        '-D',
        get_platform_safe_path(`.joystick/data/postgresql_${port}`),
        'start',
      ],
    ) : child_process.spawn('sudo',
      [
        '-u',
        'postgres',
        './pg_ctl',
        '-o',
        `"-p ${postgresql_port}"`,
        '-D',
        get_platform_safe_path(`${process.cwd()}/.joystick/data/postgresql_${port}`),
        'start'
      ],
      { cwd: `${joystick_postgresql_bin_path}/bin`, shell: '/bin/bash' }
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