import child_process from "child_process";
import path from "path";

const start_app_server_process = (exec_argv = [], watch = false) => {
  if (process.env.NODE_ENV !== 'test') {
    process.loader.print('Starting app...');
  }

  console.log(exec_argv);

  return child_process.fork(
    path.resolve(".joystick/build/index.server.js"),
    [],
    {
      execArgv: exec_argv,
      // NOTE: Pipe stdin, stdout, and stderr. IPC establishes a message channel so we
      // communicate with the child_process.
      silent: true,
      env: {
        FORCE_COLOR: "1",
        LOGS_PATH: process.env.LOGS_PATH,
        NODE_ENV: process.env.NODE_ENV,
        ROOT_URL: process.env.ROOT_URL,
        PORT: process.env.PORT,
        JOYSTICK_SETTINGS: process.env.JOYSTICK_SETTINGS,
      },
    }
  );
};

const get_exec_args = (node_major_version = 0, imports = []) => {
  const exec_argv = ["--no-warnings"];

  if (process.env.NODE_ENV === 'development') {
    // NOTE: Ensure that localhost is not swapped with ::1 (IPv6 local address) in Node v17-v19.
    // See here for information: https://github.com/nodejs/node/issues/40702#issuecomment-958157082
    exec_argv.push("--dns-result-order=ipv4first");
  }

  if (node_major_version < 19) {
    exec_argv.push("--experimental-specifier-resolution=node");
  }

  if (process.env.NODE_ENV === "development" && process.env.IS_DEBUG_MODE === "true") {
    exec_argv.push("--inspect");
  }

  for (let i = 0; i < imports?.length; i += 1) {
    const import_path = imports[i];
    exec_argv.push("--import", import_path);
  }

  return exec_argv;
};

const start_app_server = (node_major_version = 0, watch = false, imports = []) => {
  console.log({ start_app_server: imports });
  const exec_argv = get_exec_args(node_major_version, imports);
  const app_server_process = start_app_server_process(exec_argv, watch);
  return app_server_process;
};

export default start_app_server;
