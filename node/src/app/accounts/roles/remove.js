import accounts_query from '../../databases/queries/accounts.js';

const remove = (role = '') => {
  return accounts_query("remove_role", { role });
}

export default remove;