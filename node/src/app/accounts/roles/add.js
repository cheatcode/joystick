import accounts_query from "../../databases/queries/accounts.js";

const add = (role = '') => {
  return accounts_query("add_role", { role });
};

export default add;