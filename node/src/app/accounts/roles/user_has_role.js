import accounts_query from '../../databases/queries/accounts.js';

const user_has_role = (user_id = '', role = '') => {
  return accounts_query("user_has_role", { user_id, role });
};

export default user_has_role;
