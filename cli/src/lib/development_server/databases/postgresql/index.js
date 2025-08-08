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

const get_postgres_user_command = () => {
  // Only handle root user on Linux systems
  if (process.platform === 'linux' && process.getuid && process.getuid() === 0) {
    return 'su postgres -c';
  }
  return '';
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
    const postgres_user_command = get_postgres_user_command();

    const data_directory_exists = await setup_data_directory(port);

    if (!data_directory_exists) {
      // Handle root user on Linux systems only
      if (postgres_user_command) {
        try {
          await exec('id postgres');
        } catch (error) {
          // User doesn't exist, create it
          await exec('useradd -r -s /bin/false postgres');
        }
        
        // Change ownership of data directory to postgres user
        await exec(`chown -R postgres:postgres ${process.cwd()}/.joystick/data/postgresql_${port}`, {
          cwd: process.cwd()
        });
        
        // Change ownership of postgresql installation to postgres user
        await exec(`chown -R postgres:postgres ${joystick_postgresql_base_path}`, {
          cwd: process.cwd()
        });

        const initdb_command = `${postgres_user_command} "cd ${joystick_postgresql_bin_path} && ./${joystick_initdb_command} -D ${process.cwd()}/.joystick/data/postgresql_${port} --no-locale"`;
        
        await exec(initdb_command, {
          cwd: process.cwd()
        });
      } else {
        // Original behavior for non-Linux or non-root systems
        await exec(`./${joystick_initdb_command} -D ${process.cwd()}/.joystick/data/postgresql_${port} --no-locale`, {
          cwd: joystick_postgresql_bin_path
        });
      }
    }

    const existing_process_id = parseInt(await get_process_id_from_port(postgresql_port), 10);

    if (existing_process_id) {
      if (postgres_user_command) {
        const kill_command = `${postgres_user_command} "cd ${joystick_postgresql_bin_path} && ./${joystick_pg_ctl_command} kill KILL ${existing_process_id}"`;
        await exec(kill_command, {
          cwd: process.cwd()
        });
      } else {
        await exec(`./${joystick_pg_ctl_command} kill KILL ${existing_process_id}`, {
          cwd: joystick_postgresql_bin_path
        });
      }
    }

    const postgres_args = [
      `-p ${postgresql_port}`,
      '-D',
      get_platform_safe_path(`${process.cwd()}/.joystick/data/postgresql_${port}`),
    ];

    const database_process = postgres_user_command
      ? child_process.spawn('su', [
          'postgres',
          '-c',
          `cd ${joystick_postgresql_bin_path} && ./${joystick_postgres_command} ${postgres_args.join(' ')}`
        ])
      : child_process.spawn(
          `./${joystick_postgres_command}`,
          postgres_args,
          {
            cwd: joystick_postgresql_bin_path
          }
        );

    return new Promise((resolve) => {
      database_process.stderr.on('data', async (data) => {
        const stderr = data?.toString();

        if (stderr.includes('database system is ready to accept connections')) {
          const process_id = (await get_process_id_from_port(postgresql_port))?.replace('\n', '');
          const createdb_command = postgres_user_command
            ? `${postgres_user_command} "cd ${joystick_postgresql_bin_path} && ./${joystick_createdb_command} -h 127.0.0.1 -p ${postgresql_port} app"`
            : `./${joystick_createdb_command} -h 127.0.0.1 -p ${postgresql_port} app`;

          exec(createdb_command, {
            cwd: postgres_user_command ? process.cwd() : joystick_postgresql_bin_path
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
