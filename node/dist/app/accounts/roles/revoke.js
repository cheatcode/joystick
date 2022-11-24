import runUserQuery from "../runUserQuery";
var revoke_default = (userId = "", role = "") => {
  return runUserQuery("revokeRole", { userId, role });
};
export {
  revoke_default as default
};
