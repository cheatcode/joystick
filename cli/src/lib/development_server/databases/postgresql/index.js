import child_process from "child_process";
import fs from "fs";
import util from "util";
import os from "os";
import cli_log from "../../../cli_log.js";
import command_exists from "../../../command_exists.js";
import get_platform_safe_path from "../../../get_platform_safe_path.js";
import get_process_id_from_port from "../../../get_process_id_from_port.js";
import kill_port_process from "../../../kill_port_process.js";
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

const warn_postgresql_is_missing = () => {
  cli_log(
    'PostgreSQL is not installed on this computer. You can download PostgreSQL at https://www.postgresql.org/download. After you\'ve installed PostgreSQL, run joystick start again, or, remove PostgreSQL from your databases list in your settings.development.json file to skip startup.',
    {
      level: 'danger',
      docs: 'https://cheatcode.co/docs/joystick/cli#databases'
    }
  );
};

const check_if_postgresql_exists = () => {
  return command_exists("psql");
};

const check_if_postgresql_control_exists = () => {
  return command_exists("pg_ctl");
};

const start_postgresql = async (port = 2610) => {
  // const postgresql_exists = await check_if_postgresql_exists();

  // if (!postgresql_exists) {
  //   warn_postgresql_is_missing();
  //   process.exit(1);
  // }

  // const postgresql_control_exists = await check_if_postgresql_control_exists();

  // if (!postgresql_control_exists) {
  //   cli_log(
  //     'PostgreSQL is installed on this computer, but pg_ctl (what Joystick uses to start and manage PostgreSQL) is not in your command line\'s PATH variable. Add pg_ctl to your command line\'s PATH, restart your command line, and try again.',
  //     {
  //       level: 'danger',
  //       docs: 'https://cheatcode.co/docs/joystick/postgresql#path'
  //     }
  //   );
  // }

  try {
    const joystick_pg_ctl_path = `${os.homedir()}/.joystick/databases/postgresql/bin/bin/pg_ctl`;
    const joystick_createdb_path = `${os.homedir()}/.joystick/databases/postgresql/bin/bin/createdb`;
    const data_directory_exists = await setup_data_directory(port);

    if (!data_directory_exists) {
      await exec(
        `${joystick_pg_ctl_path} init -D .joystick/data/postgresql_${port} --options=--no-locale`
      );
    }

    const postgresql_port = port;
    const existing_process_id = parseInt(await get_process_id_from_port(postgresql_port), 10);

    if (existing_process_id) {
      await exec(`${joystick_pg_ctl_path} kill KILL ${existing_process_id}`);
    }

    const database_process = child_process.spawn(
      `${joystick_pg_ctl_path}`,
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

          exec(`${joystick_createdb_path} -h 127.0.0.1 -p ${postgresql_port} app`).then((data) => {
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
