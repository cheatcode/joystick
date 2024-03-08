import child_process from "child_process";
import path from "path";

const start_hmr_server_process = (exec_argv = [], __dirname = '') => {
  // NOTE: Port is automatically pulled via process.env.PORT
  // in the hmr_server.js script.
  return child_process.fork(
    path.resolve(`${__dirname}/hmr_server.js`),
    [],
    {
      execArgv: exec_argv,
      // NOTE: Pipe stdin, stdout, and stderr. IPC establishes a message channel so we
      // communicate with the child_process.
      silent: true,
    }
  );
};

const get_exec_args = (node_major_version = 0) => {
  const exec_argv = ["--no-warnings"];

  if (node_major_version < 19) {
    exec_argv.push("--experimental-specifier-resolution=node");
  }
  
  return exec_argv;
};

const start_hmr_server = (node_major_version = 0, __dirname = '') => {
  const exec_argv = get_exec_args(node_major_version);
  const hmr_server_process = start_hmr_server_process(exec_argv, __dirname);
  return hmr_server_process;
};

export default start_hmr_server;

