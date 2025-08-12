import start from './index.js';

const [_node, _bin, ...raw_args] = process.argv;

// NOTE: Capture imports here so we can process them before passing
// them to the start function.
const raw_imports =
  !!raw_args.includes('-i') && raw_args[raw_args.indexOf('-i') + 1] ||
  !!raw_args.includes('--imports') && raw_args[raw_args.indexOf('--imports') + 1];

const imports_value = raw_imports
  ? raw_imports.split(',').map((path) => path.trim())
  : [];

const definition = {
  description: 'Start an existing Joystick app.',
  args: {},
  options: {
    environment: {
      flags: {
        '-e': {
          set: !!raw_args.includes('-e'),
          value: !!raw_args.includes('-e') && raw_args[raw_args.indexOf('-e') + 1],
          parent: 'start'
        },
        '--environment': {
          set: !!raw_args.includes('--environment'),
          value: !!raw_args.includes('--environment') && raw_args[raw_args.indexOf('--environment') + 1],
          parent: 'start'
        },
      },
      description: 'Environment to set for process.env.NODE_ENV.',
    },
    port: {
      flags: {
        '-p': {
          set: !!raw_args.includes('-p'),
          value: !!raw_args.includes('-p') && parseInt(raw_args[raw_args.indexOf('-p') + 1], 10),
          parent: 'start'
        },
        '--port': {
          set: !!raw_args.includes('--port'),
          value: !!raw_args.includes('--port') && parseInt(raw_args[raw_args.indexOf('--port') + 1], 10),
          parent: 'start'
        },
      },
      description: 'Port number to run the app on.',
    },
    debug: {
      flags: {
        '-d': {
          set: !!raw_args.includes('-d'),
          value: !!raw_args.includes('-d'),
          parent: 'start'
        },
        '--debug': {
          set: !!raw_args.includes('--debug'),
          value: !!raw_args.includes('--debug'),
          parent: 'start'
        },
      },
      description: 'Run the Joystick app\'s Node.js process in debug mode with --inspect.',
    },
    imports: {
      flags: {
        '-i': {
          set: raw_imports !== undefined,
          value: imports_value,
          parent: 'start'
        },
        '--imports': {
          set: raw_imports !== undefined,
          value: imports_value,
          parent: 'start'
        },
      },
      description: 'Run the specified imports before starting your Joystick app\'s Node.js process (e.g., for APM usage).',
    },
    tests: {
      flags: {
        '-t': {
          set: !!raw_args.includes('-t'),
          value: !!raw_args.includes('-t'),
          parent: 'start'
        },
        '--tests': {
          set: !!raw_args.includes('--tests'),
          value: !!raw_args.includes('--tests'),
          parent: 'start'
        },
      },
      description: 'Run tests alongside the development server using the existing file watcher.',
    }
  },
  command: start,
}

export default definition;
