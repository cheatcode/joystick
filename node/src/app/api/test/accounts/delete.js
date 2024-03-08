import accounts_query from "../../../databases/queries/accounts.js";

const test_accounts_delete = async (req = {}, res = {}) => {
  await accounts_query('delete_user', { user_id: req?.body?.user_id });
  res.status(200).send({ data: {} });
};

export default test_accounts_delete;
