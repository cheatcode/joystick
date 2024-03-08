import accounts_query from "../databases/queries/accounts.js";
import camel_pascal_to_snake from "../../lib/camel_pascal_to_snake.js";
import create_accounts_metadata_table_columns from "../databases/postgresql/accounts/create_accounts_metadata_table_columns.js";
import database_type_map from "../databases/database_type_map.js";
import generate_account_session from "./generate_account_session.js";
import get_output from "../api/get_output.js";
import get_target_database_connection from "../databases/get_target_database_connection.js";
import hash_string from "../../lib/hash_string.js";
import roles from "./roles/index.js";
import types from "../../lib/types.js";

const add_session_to_user = (user_id = null, session = null) => {
  return accounts_query("add_session", { user_id, session });
};

const get_user_by_user_id = (user_id = "") => {
  return accounts_query("user", { _id: user_id });
};

const insert_user_in_database = async (user = {}) => {
  return accounts_query("create_user", user);
};

const sqlize_metadata = (metadata = {}) => {
  return Object.entries(metadata || {}).reduce((sqlized = {}, [key, value]) => {
    sqlized[camel_pascal_to_snake(key)] = value;
    return sqlized;
  }, {});
};

const get_user_to_create = async (options = {}) => {
  const users_database = get_target_database_connection('users');
  const users_database_type = database_type_map[users_database?.provider];

  let user = {
    password: hash_string(options.password),
  };

  if (options?.email_address || options?.emailAddress) {
    user.emailAddress = options?.email_address || options.emailAddress;
  }

  if (options?.username) {
    user.username = options?.username;
  }

  if (
    options?.metadata &&
    types.is_object(options.metadata) &&
    users_database_type === 'sql'
  ) {
    const sqlized_metadata = sqlize_metadata(options.metadata);
    await create_accounts_metadata_table_columns(users_database, sqlized_metadata);

    const metadata = { ...(options?.metadata || {}) };

    if (metadata?.roles) {
      // NOTE: We don't need roles information here so trash it.
      delete metadata.roles;
    }

    user = {
      ...(sqlize_metadata(metadata)),
      ...user,
    }
  }

  if (options?.metadata && types.is_object(options.metadata) && users_database_type === 'nosql') {
    let metadata = { ...(options?.metadata || {}) };

    if (metadata?.roles) {
      // NOTE: We don't need roles information here so trash it.
      delete metadata.roles;
    }

    // NOTE: Put metadata first to avoid overrides of account fields (e.g., passing
    // metadata.password or metadata.email_address).
    user = {
      ...(metadata || {}),
      ...user,
    };
  }

  return user;
};

const get_existing_user = (email_address = "", username = "") => {
  return accounts_query("existing_user", { email_address, username });
};

const signup = async (signup_options = {}) => {
  if (!signup_options.email_address && !signup_options.emailAddress) {
    throw new Error("Email address is required.");
  }

  if (!signup_options.password) {
    throw new Error("Password is required.");
  }

  const existing_user = await get_existing_user(
    signup_options.email_address || signup_options.emailAddress,
    signup_options?.username
  );

  if (existing_user && process.env.NODE_ENV !== 'test') {
    throw new Error(
      `A user with the ${existing_user.existing_username ? "username" : "email address"} ${
        existing_user.existing_username || existing_user.existing_email_address
      } already exists.`
    );
  }

  let user_to_create;
  // NOTE: _id on nosql databases and user_id on sql databases.
  let user_id = existing_user?._id || existing_user?.user_id;

  if (!existing_user) {
    user_to_create = await get_user_to_create(signup_options);
    user_id = await insert_user_in_database(user_to_create);
  }

  const user = await get_user_by_user_id(user_id);
  const session = generate_account_session();

  if (user_id) {
    await add_session_to_user(user_id, session);
  }

  // NOTE: Add roles to user ONLY if we're in a test environment. Do this to avoid
  // client-side attacks assigning unauthorized privileges.
  if (signup_options?.metadata?.roles?.length > 0 && process.env.NODE_ENV === 'test') {
    for (let i = 0; i < signup_options?.metadata?.roles?.length; i += 1) {
      const role = signup_options?.metadata?.roles[i];
      roles.grant(user?.user_id, role);
    }
  }

  if (
    types.is_function(process.joystick?.app_options?.accounts?.events?.onSignup) ||
    types.is_function(process.joystick?.app_options?.accounts?.events?.on_signup)
  ) {
    (process.joystick?.app_options?.accounts?.events?.onSignup || process.joystick?.app_options?.accounts?.events?.on_signup)({
      ...session,
      user_id,
      userId: user_id,
      user,
    });
  }

  return {
    ...session,
    userId: user_id,
    user_id,
    user: get_output(user, signup_options?.output),
  };
};

export default signup;
