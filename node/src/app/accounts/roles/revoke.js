import accounts_query from '../../databases/queries/accounts.js';

const revoke = (user_id = '', role = '') => {
  return accounts_query("revoke_role", { user_id, role });
};

export default revoke;
