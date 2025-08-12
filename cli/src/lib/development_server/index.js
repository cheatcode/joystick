import chalk from 'chalk';
import child_process from 'child_process';
import fs from 'fs';
import os from 'os';
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import util from 'util';
import check_if_port_occupied from './check_if_port_occupied.js';
import cli_log from '../cli_log.js';
import get_database_process_ids from './get_database_process_ids.js';
 import get_platform_safe_path from '../get_platform_safe_path.js';
import kill_port_process from '../kill_port_process.js';
import load_settings from '../load_settings.js';
import Loader from '../loader.js';
import path_exists from '../path_exists.js';
import required_files from '../required_files.js';
import start_app_server from './start_app_server.js';
import start_databases from './start_databases.js';
import start_hmr_server from './start_hmr_server.js';
import watch_for_changes from './watch_for_changes/index.js';
import constants from '../constants.js';
import kill_process_ids from './kill_process_ids.js';
import run_tests from './run_tests.js';
import debounce from '../debounce.js';
import download_database_binary from './databases/download_database_binary.js';

const { stat } = fs.promises;
const exec = util.promisify(child_process.exec);

const node_major_version = parseInt(
  process?.version?.split(".")[0]?.replace("v", ""),
  10
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const process_ids = [];

const handle_run_tests = async (watch = false) => {
  const database_process_ids = get_database_process_ids();
  await run_tests({
    watch,
    __dirname,
    process_ids: [
      ...process_ids,
      ...database_process_ids,
    ],
    cleanup_process: process.cleanup_process,
  });
};

const handle_signal_events = (process_ids = [], node_major_version = 0, __dirname = '') => {
  const exec_argv = ["--no-warnings"];

  if (node_major_version < 19) {
    exec_argv.push("--experimental-specifier-resolution=node");
  }

  const cleanup_process = child_process.fork(
    path.resolve(`${__dirname}/cleanup.js`),
    [],
    {
      // NOTE: Run in detached mode so when parent process dies, the child still runs
      // and cleanup completes. Keep silent as we don't wan't/expect any messages.
      detached: true,
      silent: true,
    }
  );

  process.cleanup_process = cleanup_process;

  process.on("SIGINT", async () => {
    const database_process_ids = get_database_process_ids();
    cleanup_process.send(JSON.stringify(({ process_ids: [...process_ids, ...database_process_ids] })));
    process.exit();
  });

  process.on("SIGTERM", async () => {
    const database_process_ids = get_database_process_ids();
    cleanup_process.send(JSON.stringify(({ process_ids: [...process_ids, ...database_process_ids] })));
    process.exit();
  });
};

const handle_signal_hmr_update = async (jobs = []) => {
  const has_settings_change = jobs?.find((job) => (job?.path?.match(constants.SETTINGS_FILE_NAME_REGEX))?.length > 0);
  const has_i18n_change = jobs?.find((job) => job?.path?.includes('i18n'));
  const has_index_html_change = jobs?.find((job) => job?.path?.includes('index.html'));
  const has_index_css_change = jobs?.find((job) => {
    return job?.path?.includes('index.css') || job?.path?.includes('css/');
  });
  const has_index_client_change = jobs?.find((job) => job?.path?.includes('index.client.js'));

  process.hmr_server_process.send(JSON.stringify({
    type: 'FILE_CHANGE',
    settings: has_settings_change ? await load_settings(process.env.NODE_ENV) : null,
    i18n_change: !!has_i18n_change,
    index_html_change: !!has_index_html_change,
    index_css_change: !!has_index_css_change,
    index_client_change: !!has_index_client_change,
  }));
};

const handle_hmr_server_process_messages = (node_major_version = 0, watch = false, old_settings = {}, imports = []) => {
  process.hmr_server_process.on("message", async (message) => {
    const process_messages = [
      "HAS_HMR_CONNECTIONS",
      "HAS_NO_HMR_CONNECTIONS",
      "HMR_UPDATE_COMPLETE",
    ];

    if (!process_messages.includes(message?.type)) {
      process.loader.print(message);
    }

    if (message?.type === "HAS_HMR_CONNECTIONS") {
      process.hmr_server_process.has_connections = true;
    }

    if (message?.type === "HAS_NO_HMR_CONNECTIONS") {
      process.hmr_server_process.has_connections = false;
    }

    if (message?.type === "HMR_UPDATE_COMPLETE") {
      if (process.app_server_process && !process.app_server_restarting) {
        process.app_server_restarting = true;
        handle_restart_app_server(node_major_version, watch, old_settings, imports);
      }
    }
  });
};

const handle_hmr_server_process_stdio = () => {
  process.hmr_server_process.on("error", (error) => {
    cli_log(error.toString(), {
      level: "danger",
      docs: "https://github.com/cheatcode/joystick",
    });
  });

  process.hmr_server_process.stdout.on("data", (data) => {
    console.log(data.toString());
  });

  process.hmr_server_process.stderr.on("data", (data) => {
    cli_log(data.toString(), {
      level: "danger",
      docs: "https://github.com/cheatcode/joystick",
    });
  });
};

const handle_start_hmr_server = (node_major_version = 0, __dirname = '', watch = false, old_settings = {}, imports = []) => {
	process.hmr_server_process = start_hmr_server(node_major_version, __dirname);
  process_ids.push(process.hmr_server_process?.pid);
  handle_hmr_server_process_stdio();
  handle_hmr_server_process_messages(node_major_version, watch, old_settings, imports);
};

const check_if_database_changes = async (old_settings = {}) => {
  const new_settings = await load_settings(process.env.NODE_ENV);
  const new_databse_settings = new_settings?.config?.databases ? JSON.stringify(new_settings?.config?.databases) : '';
  const old_database_settings = old_settings?.config?.databases ? JSON.stringify(old_settings?.config?.databases) : '';
  return new_databse_settings !== old_database_settings;
};

const handle_restart_app_server = async (node_major_version = 0, watch = false, old_settings = null, imports = []) => {
  debounce(async () => {
    const has_database_changes = await check_if_database_changes(old_settings);

    if (has_database_changes) {
      const database_process_ids = get_database_process_ids();

      cli_log(`Database configuration has changed in settings.${process.env.NODE_ENV}.json. Please restart your app to add, change, or remove databases.`, {
        level: "danger",
        docs: "https://cheatcode.co/docs/joystick/structure",
      });

      kill_process_ids([
        process.hmr_server_process?.pid,
        process.app_server_process?.pid,
        ...database_process_ids,
      ]);

      process.exit(0);
    } else {
      kill_process_ids([
        ...(process.app_server_process.external_process_ids || []),
      ]);

      await kill_port_process(process.env.PORT);
      handle_start_app_server(node_major_version, watch, imports);
    }
  }, 300);
};

const handle_app_server_process_stdio = (watch = false) => {
  // NOTE: Default this in case we never get any external process IDs.
  process.app_server_process.external_process_ids = [];

  process.app_server_process.on('message', (message_from_child) => {
    if (message_from_child?.external_process_id) {
      process.app_server_process.external_process_ids = [
        ...(process.app_server_process.external_process_ids || []),
        message_from_child?.external_process_id,
      ];
    }
  });

  process.app_server_process.on('error', (error) => {
    cli_log(error.toString(), {
      level: "danger",
      docs: "https://github.com/cheatcode/joystick",
    });
  });

  process.app_server_process.stdout.on("data", (data) => {
  	const stdout = data.toString();
    const is_startup_notification = stdout.includes("App running at:");

  	if (stdout && is_startup_notification && process.env.NODE_ENV !== 'test') {
  		process.loader.print(stdout);
  	}

    if (stdout && !is_startup_notification && !stdout.includes("BUILD_ERROR")) {
      console.log(stdout);
    }

    // NOTE: Run tests here so we can guarantee app server is running. Do a slight delay
    // to ensure that test routes are registered.
    if (stdout && is_startup_notification && process.env.NODE_ENV === 'test') {
      handle_run_tests(watch);
    }
  });

  process.app_server_process.stderr.on("data", (data) => {
    cli_log(data.toString(), {
      level: "danger",
      docs: "https://cheatcode.co/docs/joystick",
    });
  });
};

const handle_start_app_server = (node_major_version = 0, watch = false, imports = []) => {
	process.app_server_process = start_app_server(node_major_version, watch, imports);
  process_ids.push(process.app_server_process?.pid);
  handle_app_server_process_stdio(watch);
  process.app_server_restarting = false;
};

const install_missing_databases = async (settings = {}) => {
  const required_databases = settings?.config?.databases?.map((database = {}) => {
    return database?.provider;
  });

  for (let i = 0; i < required_databases?.length; i += 1) {
    const provider_name = required_databases[i];
    await download_database_binary(provider_name);
  }
};

const set_process_variables = (development_server_options = {}, port = 2600) => {
  process.title = development_server_options?.environment === 'test' ? "joystick_test" : 'joystick';
  process.project_folder = path.basename(process.cwd());
  process.loader = new Loader();

  if (development_server_options?.environment === 'test') {
    process.loader.print("\nInitializing test environment...\n");
  }

  process.env.LOGS_PATH = development_server_options?.logs || null;
  process.env.NODE_ENV = development_server_options?.environment || "development";
  process.env.PORT = port;
  process.env.IS_DEBUG_MODE = development_server_options?.debug;
};

const warn_app_port_occupied = (port = 2600) => {
  cli_log(`Port ${port} is already occupied. To start Joystick on this port, clear it and try again.`, {
    level: 'danger',
  });

  process.exit(0);
};

const get_port = (port = 2600) => {
	return parseInt(port || 2600, 10);
};

const clean_up_existing_build = async () => {
	const build_path = get_platform_safe_path(`${process.cwd()}/.joystick/build`);

	if (await path_exists(build_path)) {
		await exec(`${process.platform === 'win32' ? 'rmdir /s /q' : 'rm -rf'} ${build_path}`);
	}
};

const check_for_required_files = async () => {
  const missing_files = [];

  for (let i = 0; i < required_files?.length; i += 1) {
    const required_file = required_files[i];
    const exists = await path_exists(`${process.cwd()}/${required_file.path}`);
    const stats = exists && await stat(`${process.cwd()}/${required_file.path}`);

    if (required_file && required_file.type === "file" && (!exists || (exists && !stats.isFile()))) {
      missing_files.push({ type: 'file', path: required_file.path });
    }

    if (required_file && required_file.type === "directory" && (!exists || (exists && !stats.isDirectory()))) {
      missing_files.push({ type: 'directory', path: required_file.path });
    }
  }

  if (missing_files?.length > 0) {
    const files = missing_files?.filter((path) => path.type === 'file');
    const directories = missing_files?.filter((path) => path.type === 'directory');

    let error = `The following paths are missing and required in a Joystick project:\n\n`;

    if (files?.length > 0) {
      error += `  ${chalk.yellow('>')} Required Files:\n\n`;

      for (let i = 0; i < files?.length; i += 1) {
        const file = files[i];
        const is_last_file = i +1 === files?.length;
        error += `  ${chalk.red(`/${file.path}\n${is_last_file && directories?.length > 0 ? '\n' : ''}`)}`;
      }
    }

    if (directories?.length > 0) {
      error += `  ${chalk.yellow('>')} Required Directories:\n\n`;

      for (let i = 0; i < directories?.length; i += 1) {
        const file = directories[i];
        error += `  ${chalk.red(`/${file.path}\n`)}`;
      }
    }

    cli_log(error, {
      level: "danger",
      docs: "https://cheatcode.co/docs/joystick/structure",
    });

    process.exit(0);
  }
};

const warn_invalid_joystick_environment = async () => {
  const has_joystick_folder = await path_exists(`${process.cwd()}/.joystick`);
  const has_tests_folder = await path_exists(`${process.cwd()}/tests`);

  if (process.env.NODE_ENV === 'test' && (!has_joystick_folder || !has_tests_folder)) {
    cli_log(
      "joystick test must be run in a directory with a .joystick folder and tests folder.",
      {
        level: "danger",
        docs: "https://cheatcode.co/docs/joystick/cli/test",
      }
    );

    process.exit(0);
  }

  if (process.env.NODE_ENV !== 'test' && !has_joystick_folder) {
    cli_log(
      "joystick start must be run in a directory with a .joystick folder.",
      {
        level: "danger",
        docs: "https://cheatcode.co/docs/joystick/cli/start",
      }
    );

    process.exit(0);
  }
};

const development_server = async (development_server_options = {}) => {
  await warn_invalid_joystick_environment();
  await check_for_required_files();

	await clean_up_existing_build();

	const port = get_port(development_server_options?.port);
	const app_port_occupied = await check_if_port_occupied(port);
  const hmr_port_occupied = await check_if_port_occupied(port + 1);

  if (app_port_occupied) {
  	warn_app_port_occupied(port);
  }

  if (hmr_port_occupied) {
  	kill_port_process(port);
  }

  set_process_variables(development_server_options, port);

  const settings = await load_settings(process.env.NODE_ENV);

  await install_missing_databases(settings);

  await start_databases({
    environment: process.env.NODE_ENV,
    port,
    settings
  });

  watch_for_changes({
    hot_module_reload: (jobs = []) => handle_signal_hmr_update(jobs),
    restart_app_server: () => handle_restart_app_server(
      node_major_version,
      development_server_options?.watch,
      settings,
      development_server_options?.imports,
    ),
    start_app_server: () => handle_start_app_server(
      node_major_version,
      development_server_options?.watch,
      development_server_options?.imports,
    ),
    start_hmr_server: development_server_options?.environment !== 'test' ? () => handle_start_hmr_server(
      node_major_version,
      __dirname,
      development_server_options?.watch,
      settings,
      development_server_options?.imports,
    ) : null,
  }, {
    excluded_paths: settings?.config?.build?.excluded_paths,
    custom_copy_paths: settings?.config?.build?.copy_paths?.map((path) => {
      return { path };
    }) || [],
  });

  handle_signal_events(process_ids, node_major_version, __dirname);
};

export default development_server;
