import create from './index.js';

const [_node, _bin, ...raw_args] = process.argv;

const definition = {
  description: 'Create a new Joystick app.',
  args: {
    name: {
      set: !!raw_args.includes('create') && !!raw_args[raw_args.indexOf('create') + 1],
      parent: 'create',
      value: !!raw_args.includes('create') && raw_args[raw_args.indexOf('create') + 1],
      description: 'The name of the app to create.',
    },
  },
  options: {
    release: {
      flags: {
        '-r': {
          set: !!raw_args.includes('-r'),
          value: !!raw_args.includes('-r') && raw_args[raw_args.indexOf('-r') + 1],
          parent: 'create',
        },
        '--release': {
          set: !!raw_args.includes('--release'),
          value: !!raw_args.includes('--release') && raw_args[raw_args.indexOf('--release') + 1],
          parent: 'create',
        },
      },
      description: 'The release of Joystick to use (production or canary).',
    },
  },
  command: create,
};

export default definition;
