import update from './index.js';

const [_node, _bin, ...raw_args] = process.argv;

const definition = {
  description: 'Update all Joystick packages to their latest version.',
  args: {},
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
      description: 'The release of Joystick to update (production or canary).',
    },
  },
  command: update,
};

export default definition;
