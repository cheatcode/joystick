import test from './index.js';

const [_node, _bin, ...raw_args] = process.argv;

const definition = {
  description: 'Start an existing Joystick app and run its tests.',
  args: {},
  options: {
    watch: {
      flags: {
        '-w': {
          set: !!raw_args.includes('-w'),
          value: !!raw_args.includes('-w'),
          parent: 'test'
        },
        '--watch': {
          set: !!raw_args.includes('--watch'),
          value: !!raw_args.includes('--watch'),
          parent: 'test'
        },
      },
      description: 'Run joystick test in watch mode.',
    },
  },
  command: test,
};

export default definition;
