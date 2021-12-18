import runUserQuery from "../runUserQuery";
var userHasRole_default = (userId = "", role = "") => {
  return runUserQuery("userHasRole", { userId, role });
};
export {
  userHasRole_default as default
};
