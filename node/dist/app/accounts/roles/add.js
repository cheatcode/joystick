import runUserQuery from "../runUserQuery";
var add_default = (role = "") => {
  return runUserQuery("addRole", { role });
};
export {
  add_default as default
};
