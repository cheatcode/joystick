import child_process from "child_process";
import cli_log from "../cli_log.js";
import chalk from 'chalk';

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

const run_tests_integrated = (run_tests_options = {}) => {
  const ava_path = `${process.cwd()}/node_modules/.bin/ava`;
  
  return new Promise((resolve, reject) => {
    // NOTE: Run ava directly and handle TAP output inline to avoid process exit issues
    const ava = child_process.spawn(ava_path, [
      '--config', `${run_tests_options?.__dirname}/ava_config.js`,
      '--tap'
    ], {
      env: {
        ...(process.env),
        databases: process.databases,
        FORCE_COLOR: "1"
      }
    });

    // NOTE: Import and use the tap reporter functionality directly
    let buffer = '';
    let passed = 0;
    let failed = 0;
    let pending_fail = null;
    let in_diag = false;
    let diag_lines = [];
    const start_ns = process.hrtime.bigint();

    const green = (s) => `\x1b[32m${s}\x1b[0m`;
    const red = (s) => `\x1b[31m${s}\x1b[0m`;
    const gray = (s) => `\x1b[90m${s}\x1b[0m`;

    const parse_title = (line) => {
      const ok_match = line.match(/^ok\s+\d+\s+(.*)$/);
      if (ok_match)
        return { status: 'ok', title: ok_match[1].trim().replace(/^- /, '') };
      const not_ok_match = line.match(/^not ok\s+\d+\s+(.*)$/);
      if (not_ok_match)
        return {
          status: 'not_ok',
          title: not_ok_match[1].trim().replace(/^- /, ''),
        };
      return null;
    };

    const print_pass = (title) => {
      process.stdout.write(`${green('✔')} ${title}\n`);
    };

    const print_fail = (title, detail) => {
      process.stdout.write(`\n${red('-!-')}\n`);
      process.stdout.write(`\n${red('✖')} ${title}\n\n`);
      process.stdout.write(`${red('Error:')}\n\n`);
      if (detail && detail.trim()) {
        process.stdout.write(`  ${detail.trim()}\n\n`);
      } else {
        process.stdout.write(`  (no stack trace)\n\n`);
      }
      process.stdout.write(`${red('-!-')}\n\n`);
    };

    const handle_line = (raw_line) => {
      const line = raw_line.replace(/\r$/, '');
      if (!line) return;

      if (in_diag) {
        if (line.trim() === '...') {
          print_fail(pending_fail?.title || '(unknown)', diag_lines.join('\n'));
          failed += 1;
          pending_fail = null;
          in_diag = false;
          diag_lines = [];
          return;
        }
        diag_lines.push(line);
        return;
      }

      if (/^\s*---\s*$/.test(line) && pending_fail) {
        in_diag = true;
        diag_lines = [];
        return;
      }

      const parsed = parse_title(line);
      if (parsed) {
        if (parsed.status === 'ok') {
          passed += 1;
          print_pass(parsed.title);
        } else if (parsed.status === 'not_ok') {
          pending_fail = { title: parsed.title };
        }
        return;
      }
    };

    // NOTE: Process ava stdout (TAP output)
    ava.stdout.on('data', (chunk) => {
      buffer += chunk.toString();
      const parts = buffer.split('\n');
      buffer = parts.pop() || '';
      for (const part of parts) handle_line(part);
    });

    // NOTE: Handle ava stderr directly
    ava.stderr.on('data', (data) => {
      const stderr_string = data.toString();
      if (!stderr_string.includes('Using configuration')) {
        process.stderr.write(data);
      }
    });

    // NOTE: Handle process exit without propagating to parent
    ava.on('exit', (code, signal) => {
      // NOTE: Process any remaining buffer
      if (buffer.trim()) {
        handle_line(buffer);
      }

      // NOTE: Handle any pending failures
      if (pending_fail) {
        print_fail(pending_fail.title, diag_lines.join('\n'));
        failed += 1;
      }

      // NOTE: Print summary
      const end_ns = process.hrtime.bigint();
      const duration_ms = Number(end_ns - start_ns) / 1e6;
      const duration_str =
        duration_ms < 1000
          ? `${duration_ms.toFixed(0)} ms`
          : duration_ms < 60000
          ? `${(duration_ms / 1000).toFixed(2)} s`
          : `${Math.floor(duration_ms / 60000)}m ${(
              (duration_ms % 60000) /
              1000
            ).toFixed(2)}s`;

      process.stdout.write(
        `\n${gray('===')}\n\n${green('Passed:')} ${passed}\n${red(
          'Failed:'
        )} ${failed}\n${gray('Duration:')} ${duration_str}\n\n`
      );

      // NOTE: Always resolve, never reject - we want to keep servers running
      resolve();
    });

    // NOTE: Handle any errors without crashing parent process
    ava.on('error', (error) => {
      console.error('Test runner error:', error.message);
      resolve();
    });
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
  const tap_reporter_path = `${run_tests_options?.__dirname}/tap_reporter.js`;
  
  return new Promise((resolve) => {
    // NOTE: Despite using the app's node_modules path to reference Ava, we still want to reference
    // the internal path here for the default test config in /lib/dev/tests.config.js.
    // Use TAP output and pipe to custom reporter only when not in watch mode
    const base_command = `DEBUG=ava:watcher && ${ava_path} --config ${run_tests_options?.__dirname}/ava_config.js`;
    const watch_flag = run_tests_options?.watch ? '--watch' : '';
    const tap_pipe = run_tests_options?.watch ? '' : `--tap | node ${tap_reporter_path}`;
    const full_command = `${base_command} ${watch_flag} ${tap_pipe}`;
    
    const ava = child_process.exec(full_command, {
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

export { run_tests_integrated };
export default run_tests;
