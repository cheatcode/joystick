import accounts_query from '../../databases/queries/accounts.js';

const list = () => {
  return accounts_query("list_roles");
};

export default list;
