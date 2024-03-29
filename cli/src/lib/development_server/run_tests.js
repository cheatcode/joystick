import child_process from "child_process";
import cli_log from "../cli_log.js";

const handle_ava_stderr = (stderr = '') => {
  // NOTE: Squash output about using a configuration file (we always do in the framework).
  if (stderr?.includes('Using configuration')) {
    return null;
  }

  if (stderr?.includes('No tests found')) {
    return cli_log('No tests found. Add tests in the /tests folder at the root of your Joystick app.', {
      level: 'danger',
      docs: 'https://cheatcode.co/docs/joystick/test/setup',
    });
  }
  
  console.log(stderr);
};

const handle_ava_stdout = (stdout = '') => {
  // NOTE: Squash output about using a configuration file (we always do in the framework).
  if (stdout?.includes('Using configuration')) {
    return null;
  }

  if (stdout?.includes('No tests found in')) {
    const [message] = stdout?.split(',');
    return console.log(`${message}\n`);
  }
  
  console.log(stdout);
};

const handle_ava_stdio = (ava = {}, run_tests_options = {}) => {
  ava.stdout.on('data', function (data) {
    const string = data.toString();
    handle_ava_stdout(string, run_tests_options);
  });

  ava.stderr.on('data', function (data) {
    const string = data.toString();
    handle_ava_stderr(string, run_tests_options);
  });
};

const run_tests = (run_tests_options = {}) => {
  // NOTE: A little bananas to reason through this. In order for Ava to run w/o errors,
  // the Ava binary being run here has to be identical to the one used in @joystick.js/test.
  // That would equal the copy of Ava that's installed in a Joystick app's node_modules
  // directory, not the node_modules directory of the CLI here. We can guarantee that will
  // exist for the CLI here because a developer has to install @joystick.js/test which will
  // add Ava as a dependency to their app in order to write tests.
  const ava_path = `${process.cwd()}/node_modules/.bin/ava`;
  
  return new Promise((resolve) => {
    // NOTE: Despite using the app's node_modules path to reference Ava, we still want to reference
    // the internal path here for the default test config in /lib/dev/tests.config.js.
    const ava = child_process.exec(`DEBUG=ava:watcher && ${ava_path} --config ${run_tests_options?.__dirname}/ava_config.js ${run_tests_options?.watch ? '--watch' : ''}`, {
      stdio: 'inherit',
      env: {
        ...(process.env),
        databases: process.databases,
        FORCE_COLOR: "1"
      }
    }, (error) => {
      if (!error) {
        // NOTE: Do this here because the standard SIGINT and SIGTERM hooks the dev process
        // listens for don't catch a clean exit (and the process.exit() hook fires after exit).
        run_tests_options.cleanup_process.send(JSON.stringify(({ process_ids: run_tests_options?.process_ids })));
        process.exit(0);
      } else {
        // NOTE: Do not report any Ava errors here because they're picked up by the handle_ava_stdio();
        // hook below. Just do a clean exit here so Node doesn't hang.
        run_tests_options.cleanup_process.send(JSON.stringify(({ process_ids: run_tests_options?.process_ids })));
        process.exit(0);
      }
    });

    handle_ava_stdio(ava, run_tests_options);
  });
};

export default run_tests;

