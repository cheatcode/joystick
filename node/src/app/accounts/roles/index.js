import add from './add.js';
import remove from './remove.js';
import list from './list.js';
import grant from './grant.js';
import revoke from './revoke.js';
import user_has_role from './user_has_role.js';

const roles = {
  add,
  remove,
  list,
  grant,
  revoke,
  userHasRole: user_has_role,
  user_has_role,
};

export default roles;
