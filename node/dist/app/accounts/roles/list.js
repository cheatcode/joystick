import runUserQuery from "../runUserQuery";
var list_default = (role = "") => {
  return runUserQuery("listRoles");
};
export {
  list_default as default
};
