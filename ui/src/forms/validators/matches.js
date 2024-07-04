import types from '../../lib/types.js';

const matches = (rule, value = "") => {
  if (types.is_function(value)) {
    return rule === value();
  }

  return rule === value;
};

export default matches;
