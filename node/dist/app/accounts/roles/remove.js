import runUserQuery from "../runUserQuery";
var remove_default = (role = "") => {
  return runUserQuery("removeRole", { role });
};
export {
  remove_default as default
};
