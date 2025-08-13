import child_process from "child_process";
import path from "path";

const start_app_server_process = (exec_argv = [], watch = false, env_options = {}) => {
  const node_env = env_options.NODE_ENV || process.env.NODE_ENV;
  
  if (node_env !== 'test') {
    process.loader.print('Starting app...');
  }

  const env = {
    FORCE_COLOR: "1",
    LOGS_PATH: env_options.LOGS_PATH || process.env.LOGS_PATH,
    NODE_ENV: node_env,
    ROOT_URL: env_options.ROOT_URL || process.env.ROOT_URL,
    PORT: env_options.PORT || process.env.PORT,
    JOYSTICK_SETTINGS: env_options.JOYSTICK_SETTINGS || process.env.JOYSTICK_SETTINGS,
  };

  return child_process.fork(
    path.resolve(".joystick/build/index.server.js"),
    [],
    {
      execArgv: exec_argv,
      // NOTE: Pipe stdin, stdout, and stderr. IPC establishes a message channel so we
      // communicate with the child_process.
      silent: true,
      env: env,
    }
  );
};

const get_exec_args = (node_major_version = 0, imports = [], env_options = {}) => {
  const exec_argv = ["--no-warnings"];
  const node_env = env_options.NODE_ENV || process.env.NODE_ENV;
  const is_debug_mode = env_options.IS_DEBUG_MODE || process.env.IS_DEBUG_MODE;

  if (node_env === 'development') {
    // NOTE: Ensure that localhost is not swapped with ::1 (IPv6 local address) in Node v17-v19.
    // See here for information: https://github.com/nodejs/node/issues/40702#issuecomment-958157082
    exec_argv.push("--dns-result-order=ipv4first");
  }

  if (node_major_version < 19) {
    exec_argv.push("--experimental-specifier-resolution=node");
  }

  if (node_env === "development" && is_debug_mode === "true") {
    exec_argv.push("--inspect");
  }

  for (let i = 0; i < imports?.length; i += 1) {
    const import_path = imports[i];
    exec_argv.push("--import", import_path);
  }

  return exec_argv;
};

const start_app_server = (node_major_version = 0, watch = false, imports = [], env_options = {}) => {
  const exec_argv = get_exec_args(node_major_version, imports, env_options);
  const app_server_process = start_app_server_process(exec_argv, watch, env_options);
  return app_server_process;
};

export default start_app_server;
