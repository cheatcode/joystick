import accounts_query from "../databases/queries/accounts.js";

export default (user_id = '', session = {}) => {
	return accounts_query('add_session', { user_id, session });
};
