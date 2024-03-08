import accounts_query from "../../databases/queries/accounts.js";

const grant = (user_id = '', role = '') => {
  return accounts_query("grant_role", { user_id, role });
};

export default grant;