import add from "./add";
import remove from "./remove";
import list from "./list";
import grant from "./grant";
import revoke from "./revoke";
import userHasRole from "./userHasRole";
var roles_default = {
  add,
  remove,
  list,
  grant,
  revoke,
  userHasRole
};
export {
  roles_default as default
};
