import accounts_query from "../databases/queries/accounts.js";
import types from "../../lib/types.js";

const delete_user = async (delete_user_options = {}) => {
  await accounts_query('delete_user', { user_id: delete_user_options?.user_id });

  if (
    types.is_function(process.joystick?.app_options?.accounts?.events?.onDeleteUser) ||
    types.is_function(process.joystick?.app_options?.accounts?.events?.on_delete_user)
  ) {
    (
      process.joystick?.app_options?.accounts?.events?.onDeleteUser ||
      process.joystick?.app_options?.accounts?.events?.on_delete_user
    )(delete_user_options?.user_id);
  }
};

export default delete_user;
