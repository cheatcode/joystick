import build from './index.js';

const [_node, _bin, ...raw_args] = process.argv;

const definition = {
  description: 'Build an existing Joystick app.',
  args: {},
  options: {
    environment: {
      flags: {
        '-e': {
          set: !!raw_args.includes('-e'),
          value: !!raw_args.includes('-e') && raw_args[raw_args.indexOf('-e') + 1],
          parent: 'build',
        },
        '--environment': {
          set: !!raw_args.includes('--environment'),
          value: !!raw_args.includes('--environment') && raw_args[raw_args.indexOf('--environment') + 1],
          parent: 'build',
        },
      },
      description: 'The NODE_ENV you want to use for your build (default: production).',
    },
    outputPath: {
      flags: {
        '-o': {
          set: !!raw_args.includes('-o'),
          value: !!raw_args.includes('-o') && raw_args[raw_args.indexOf('-o') + 1],
          parent: 'build',
        },
        '--outputPath': {
          set: !!raw_args.includes('--outputPath'),
          value: !!raw_args.includes('--outputPath') && raw_args[raw_args.indexOf('--outputPath') + 1],
          parent: 'build',
        },
      },
      description: 'The path you want to build the output to.',
    },
    type: {
      flags: {
        '-t': {
          set: !!raw_args.includes('-t'),
          value: !!raw_args.includes('-t') && raw_args[raw_args.indexOf('-t') + 1],
          parent: 'build',
        },
        '--type': {
          set: !!raw_args.includes('--type'),
          value: !!raw_args.includes('--type') && raw_args[raw_args.indexOf('--type') + 1],
          parent: 'build',
        },
      },
      description: 'The type of build you want to generate (tar or folder).',
    },
  },
  command: build,
};

export default definition;
