/* eslint-disable consistent-return */

import accounts_query from "../databases/queries/accounts.js";

const mark_email_verified_at = (user_id = "", token = "") => {
  return accounts_query("mark_email_verified_at", { user_id, token });
};

const get_user_from_token = (verify_email_token = "") => {
  return accounts_query("user_with_verify_email_token", {
    token: verify_email_token,
  });
};

const verify_email = async (verify_email_options = {}) => {
  const user = await get_user_from_token(verify_email_options?.token);

  if (!user) {
    throw new Error(`A user with this token could not be found.`);
  }

  await mark_email_verified_at(user?._id || user?.user_id, verify_email_options?.token);

  if (typeof process.joystick?.app_options?.accounts?.events?.onVerifyEmail === 'function') {
    process.joystick?.app_options?.accounts?.events?.onVerifyEmail(user?.emailAddress || user?.email_address);
  }

  return true;
};

export default verify_email;

