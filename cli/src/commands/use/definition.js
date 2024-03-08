import use from './index.js';

const [_node, _bin, ...raw_args] = process.argv;

const definition = {
  description: 'Decides which release of Joystick to use (production or canary).',
  args: {
    release: {
      set: !!raw_args.includes('use') && !!raw_args[raw_args.indexOf('use') + 1],
      parent: 'use',
      value: !!raw_args.includes('use') && raw_args[raw_args.indexOf('use') + 1],
      description: 'The release of Joystick to use (production or canary).',
    },
  },
  options: {},
  command: use
};

export default definition;
