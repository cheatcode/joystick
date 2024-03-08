/* eslint-disable consistent-return */

import generate_id from "../../lib/generate_id.js";
import accounts_query from "../databases/queries/accounts.js";

const add_reset_token_to_user = (email_address = '', token = '') => {
  return accounts_query("add_password_reset_token", { email_address, token });
};

const generate_password_reset_token = async (email_address = '') => {
  const token = generate_id(32);
  await add_reset_token_to_user(email_address, token);
  return token;
};

export default generate_password_reset_token;
