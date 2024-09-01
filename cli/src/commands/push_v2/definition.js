import push from './index.js';

const [_node, _bin, ...raw_args] = process.argv;

const definition = {
  description: 'Deploy your Joystick app using Push.',
  args: {},
  options: {
    domain: {
      flags: {
        '-d': {
          set: !!raw_args.includes('-d'),
          value: !!raw_args.includes('-d') && raw_args[raw_args.indexOf('-d') + 1],
          parent: 'push',
        },
        '--domain': {
          set: !!raw_args.includes('--domain'),
          value: !!raw_args.includes('--domain') && raw_args[raw_args.indexOf('--domain') + 1],
          parent: 'push',
        },
      },
      description: 'The domain of the app Push should deploy to.',      
    },
    environment: {
     flags: {
       '-e': {
         set: !!raw_args.includes('-e'),
         value: !!raw_args.includes('-e') && raw_args[raw_args.indexOf('-e') + 1],
         parent: 'push',
       },
       '--environment': {
         set: !!raw_args.includes('--environment'),
         value: !!raw_args.includes('--environment') && raw_args[raw_args.indexOf('--environment') + 1],
         parent: 'push',
       },
     },
     description: 'The value you want to use for NODE_ENV in the deployed app (e.g., staging or production). Default is production.',
    },
    push_server: {
     flags: {
       '-s': {
         set: !!raw_args.includes('-s'),
         value: !!raw_args.includes('-s') && raw_args[raw_args.indexOf('-s') + 1],
         parent: 'push',
       },
       '--server': {
         set: !!raw_args.includes('--server'),
         value: !!raw_args.includes('--server') && raw_args[raw_args.indexOf('--server') + 1],
         parent: 'push',
       },
     },
     description: 'The Push provision server to target (development or production).',
    },
    deployment_token: {
      flags: {
        '-t': {
          set: !!raw_args.includes('-t'),
          value: !!raw_args.includes('-t') && raw_args[raw_args.indexOf('-t') + 1],
          parent: 'push',
        },
        '--token': {
          set: !!raw_args.includes('--token'),
          value: !!raw_args.includes('--token') && raw_args[raw_args.indexOf('--token') + 1],
          parent: 'push',
        },
      },
      description: 'The deployment token for your Push user account.',
     },    
  },
  command: push,
};

export default definition;
