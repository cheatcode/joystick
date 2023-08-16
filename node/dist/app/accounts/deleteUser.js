import runUserQuery from "./runUserQuery.js";
var deleteUser_default = (userId = "") => {
  return runUserQuery("deleteUser", { userId });
};
export {
  deleteUser_default as default
};
