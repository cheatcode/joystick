import accounts_query from "../databases/queries/accounts.js";
import hash_string from "../../lib/hash_string.js";
import types from "../../lib/types.js";

const reset_user_sessions = (user_id = null) => {
  return accounts_query("reset_user_sessions", { user_id });
};

const set_new_password_on_user = async (user_id = "", password = "") => {
  const hashed_password = hash_string(password);
  await accounts_query("set_new_password", { user_id, hashed_password });
  return hashed_password;
};

const get_user = (user_id = "") => {
  return accounts_query("user", { _id: user_id });
};

const set_password = async (set_password_options = {}) => {
  if (!set_password_options?.user_id || !set_password_options?.password) {
    throw new Error('Must provider a user_id and password to set.');
  }

  const user = await get_user(set_password_options?.user_id);

  if (!user) {
    throw new Error("Invalid user_id.");
  }

  await set_new_password_on_user(user?._id || user?.user_id, set_password_options?.password);
  await reset_user_sessions(user?._id || user?.user_id);
  
  if (
    types.is_function(process.joystick?.app_options?.accounts?.events?.onSetPassword) ||
    types.is_function(process.joystick?.app_options?.accounts?.events?.on_set_password)
  ) {
    (
      process.joystick?.app_options?.accounts?.events?.onSetPassword ||
      process.joystick?.app_options?.accounts?.events?.on_set_password
    )(set_password_options?.user_id);
  }

  return true;
};

export default set_password;
