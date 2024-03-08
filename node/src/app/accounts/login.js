/* eslint-disable consistent-return */

import bcrypt from "bcrypt";
import accounts_query from "../databases/queries/accounts.js";
import generate_account_session from "./generate_account_session.js";
import get_output from "../api/get_output.js";
import types from "../../lib/types.js";

const add_session_to_user = (user_id = null, session = null) => {
  return accounts_query("add_session", { user_id, session });
};

const get_existing_session = (user_id = null) => {
  return accounts_query("get_existing_session", { user_id });
};

const delete_old_sessions = (user_id = null) => {
  return accounts_query("delete_old_sessions", { user_id });
};

const check_if_valid_password = (password_from_login = null, password_hash_from_user = null) => {
  return bcrypt.compareSync(password_from_login, password_hash_from_user);
};

const login = async (login_options = {}) => {
  const user = await accounts_query("user", {
    email_address: login_options.email_address || login_options.emailAddress,
    username: login_options.username,
  });

  if (!user) {
    throw new Error(
      `A user with the ${
        login_options.email_address || login_options.emailAddress ? "email address" : "username"
      } ${login_options.email_address || login_options.emailAddress || login_options.username} could not be found.`
    );
  }

  const is_valid_password = check_if_valid_password(
    login_options.password,
    user.password
  );

  if (!is_valid_password) {
    throw new Error('Incorrect password.');
  }

  const user_id = user?._id || user?.user_id;

  await delete_old_sessions(user_id);

  let session = await get_existing_session(user_id);

  if (!session) {
    session = generate_account_session();
    await add_session_to_user(user_id, session);
  }

  const { password, sessions, ...rest_of_user } = user;

  if (
    types.is_function(process.joystick?.app_options?.accounts?.events?.onLogin) || 
    types.is_function(process.joystick?.app_options?.accounts?.events?.on_login)
  ) {
    (process.joystick?.app_options?.accounts?.events?.onLogin || process.joystick?.app_options?.accounts?.events?.on_login)({
      ...session,
      user,
    });
  }

  return {
    ...session,
    user: get_output(
      {
        ...rest_of_user,
      },
      login_options?.output
    ),
  };
};

export default login;
