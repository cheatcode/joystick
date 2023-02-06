import build from './build/index.js';
import create from './create/index.js';
import logout from './logout/index.js';
import push from './push/index.js';
import start from './start/index.js';
import update from './update/index.js';

const [_node, _bin, ...rawArgs] = process.argv;

export default {
  build: {
    set: !!rawArgs.includes('build'),
    description: 'Build an existing Joystick app.',
    args: {},
    options: {
      environment: {
        flags: {
          '-e': {
            set: !!rawArgs.includes('-e'),
            value: !!rawArgs.includes('-e') && rawArgs[rawArgs.indexOf('-e') + 1],
          },
          '--environment': {
            set: !!rawArgs.includes('--environment'),
            value: !!rawArgs.includes('--environment') && rawArgs[rawArgs.indexOf('--environment') + 1],
          },
        },
        description: 'The NODE_ENV you want to use for your build (default: production).',
      },
      outputPath: {
        flags: {
          '-o': {
            set: !!rawArgs.includes('-o'),
            value: !!rawArgs.includes('-o') && rawArgs[rawArgs.indexOf('-o') + 1],
          },
          '--outputPath': {
            set: !!rawArgs.includes('--outputPath'),
            value: !!rawArgs.includes('--outputPath') && rawArgs[rawArgs.indexOf('--outputPath') + 1],
          },
        },
        description: 'The path you want to build the output to.',
      },
      type: {
        flags: {
          '-t': {
            set: !!rawArgs.includes('-t'),
            value: !!rawArgs.includes('-t') && rawArgs[rawArgs.indexOf('-t') + 1],
          },
          '--type': {
            set: !!rawArgs.includes('--type'),
            value: !!rawArgs.includes('--type') && rawArgs[rawArgs.indexOf('--type') + 1],
          },
        },
        description: 'The type of build you want to generate (tar or folder).',
      },
    },
    function: build,
  },
  create: {
    set: !!rawArgs.includes('create'),
    description: 'Create a new Joystick app.',
    args: {
      name: {
        set: !!rawArgs.includes('create') && !!rawArgs[rawArgs.indexOf('create') + 1],
        value: !!rawArgs.includes('create') && rawArgs[rawArgs.indexOf('create') + 1],
        description: 'The name of the app to create.',
      },
    },
    options: {},
    function: create,
  },
  logout: {
    set: !!rawArgs.includes('logout'),
    description: 'Log out of your CheatCode account.',
    args: {},
    options: {},
    function: logout,
  },
  push: {
    set: !!rawArgs.includes('push'),
    description: 'Deploy your Joystick app.',
    args: {},
    options: {
      domain: {
        flags: {
          '-d': {
            set: !!rawArgs.includes('-d'),
            value: !!rawArgs.includes('-d') && rawArgs[rawArgs.indexOf('-d') + 1],
          },
          '--domain': {
            set: !!rawArgs.includes('--domain'),
            value: !!rawArgs.includes('--domain') && rawArgs[rawArgs.indexOf('--domain') + 1],
          },
        },
        description: 'The domain name you want to deploy your app to.',
      },
      environment: {
        flags: {
          '-e': {
            set: !!rawArgs.includes('-e'),
            value: !!rawArgs.includes('-e') && rawArgs[rawArgs.indexOf('-e') + 1],
          },
          '--environment': {
            set: !!rawArgs.includes('--environment'),
            value: !!rawArgs.includes('--environment') && rawArgs[rawArgs.indexOf('--environment') + 1],
          },
        },
        description: 'The value you want to use for NODE_ENV in the deployed app (e.g., staging or production). Default is production.',
      },
    },
    function: push,
  },
  start: {
    set: !!rawArgs.includes('start'),
    description: 'Start an existing Joystick app.',
    args: {},
    options: {
      environment: {
        flags: {
          '-e': {
            set: !!rawArgs.includes('-e'),
            value: !!rawArgs.includes('-e') && rawArgs[rawArgs.indexOf('-e') + 1],
          },
          '--environment': {
            set: !!rawArgs.includes('--environment'),
            value: !!rawArgs.includes('--environment') && rawArgs[rawArgs.indexOf('--environment') + 1],
          },
        },
        description: 'Environment to set for process.env.NODE_ENV.',
      },
      logs: {
        flags: {
          '-l': {
            set: !!rawArgs.includes('-l'),
            value: !!rawArgs.includes('-l') && rawArgs[rawArgs.indexOf('-l') + 1],
          },
          '--logs': {
            set: !!rawArgs.includes('--logs'),
            value: !!rawArgs.includes('--logs') && rawArgs[rawArgs.indexOf('--logs') + 1],
          },
        },
        description: 'Path for storing logs.',
      },
      port: {
        flags: {
          '-p': {
            set: !!rawArgs.includes('-p'),
            value: !!rawArgs.includes('-p') && parseInt(rawArgs[rawArgs.indexOf('-p') + 1], 10),
          },
          '--port': {
            set: !!rawArgs.includes('--port'),
            value: !!rawArgs.includes('--port') && parseInt(rawArgs[rawArgs.indexOf('--port') + 1], 10),
          },
        },
        description: 'Port number to run the app on.',
      },
      debug: {
        flags: {
          '-d': {
            set: !!rawArgs.includes('-d'),
            value: !!rawArgs.includes('-d'),
          },
          '--debug': {
            set: !!rawArgs.includes('--debug'),
            value: !!rawArgs.includes('--debug'),
          },
        },
        description: 'Run the Joystick app\'s Node.js process in debug mode with --inspect.',
      }
    },
    function: start,
  },
  update: {
    set: !!rawArgs.includes('update'),
    description: 'Update all Joystick packages to their latest version.',
    args: {},
    options: {},
    function: update,
  },
};
