import help from './index.js';

const [_node, _bin, ...raw_args] = process.argv;

const definition = {
  description: 'Output this help information',
  args: {},
  options: {},
  command: help,
};

export default definition;
