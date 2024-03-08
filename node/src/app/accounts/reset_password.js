import accounts_query from "../databases/queries/accounts.js";
import generate_account_session from "./generate_account_session.js";
import get_output from "../api/get_output.js";
import hash_string from "../../lib/hash_string.js";
import types from "../../lib/types.js";

const remove_token_from_user = (user_id = null, token = null) => {
  return accounts_query("remove_reset_token", { user_id, token });
};

const add_session_to_user = (user_id = null, session = null) => {
  return accounts_query("add_session", { user_id, session });
};

const set_new_password_on_user = async (user_id = "", password = "") => {
  const hashed_password = hash_string(password);
  await accounts_query("set_new_password", { user_id, hashed_password });
  return hashed_password;
};

const reset_user_sessions = (user_id = '') => {
  return accounts_query("reset_user_sessions", { user_id });
};

const get_user_with_token = (token = "") => {
  return accounts_query("user_with_reset_token", {
    "passwordResetTokens.token": token,
  });
};

const reset_password = async (reset_password_options = {}) => {
  const user = await get_user_with_token(reset_password_options.token);

  if (!user) {
    throw new Error('Invalid password reset token.');
  }

  await reset_user_sessions(user?._id || user?.user_id);

  await set_new_password_on_user(
    user?._id || user?.user_id,
    reset_password_options.password
  );

  const updated_user = await remove_token_from_user(
    user?._id || user?.user_id,
    reset_password_options.token
  );

  const session = generate_account_session();
  await add_session_to_user(updated_user?._id || updated_user?.user_id, session);

  if (
    types.is_function(process.joystick?.app_options?.accounts?.events?.onResetPassword) ||
    types.is_function(process.joystick?.app_options?.accounts?.events?.on_reset_password)
  ) {
    (process.joystick?.app_options?.accounts?.events?.onResetPassword || process.joystick?.app_options?.accounts?.events?.on_reset_password)({
      user: updated_user,
      ...session,
    });
  }

  return {
    user: get_output(updated_user, reset_password_options?.output),
    ...session,
  };
};

export default reset_password;