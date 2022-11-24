import runUserQuery from "../runUserQuery";
var grant_default = (userId = "", role = "") => {
  return runUserQuery("grantRole", { userId, role });
};
export {
  grant_default as default
};
