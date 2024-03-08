import accounts_query from "../databases/queries/accounts.js";
import generate_password_reset_token from "./generate_password_reset_token.js";
import load_settings from "../settings/load.js";
import send_email from "../email/send.js";
import types from "../../lib/types.js";

const settings = load_settings();

const get_existing_reset_token = (user_id = '') => {
  return accounts_query('get_password_reset_token', { user_id });
};

const get_user = (email_address = '') => {
  return accounts_query('user', { email_address });
};

const recover_password = async (recover_password_options = {}) => {
  const user = await get_user(recover_password_options?.email_address || recover_password_options?.emailAddress);

  if (!user) {
    throw new Error(`A user with the email address ${recover_password_options?.email_address || recover_password_options?.emailAddress} could not be found.`);
  }

  const existing_reset_token = await get_existing_reset_token(user?._id || user?.user_id);
  const reset_token = existing_reset_token || await generate_password_reset_token(recover_password_options.email_address || recover_password_options.emailAddress);

  const domain = process.env.ROOT_URL || `http://localhost:${process.env.PORT}`;
  const url = `${domain}/reset-password/${reset_token}`;

  if (process.env.NODE_ENV === "development") {
    console.log(`Reset Password URL: ${url}`);
  }

  if (
    types.is_function(process.joystick?.app_options?.accounts?.events?.onRecoverPassword) ||
    types.is_function(process.joystick?.app_options?.accounts?.events?.on_recover_password)
  ) {
    (
      process.joystick?.app_options?.accounts?.events?.onRecoverPassword ||
      process.joystick?.app_options?.accounts?.events?.on_recover_password
    )(recover_password_options?.email_address || recover_password_options?.emailAddress);
  }

  await send_email({
    to: recover_password_options.email_address || recover_password_options?.emailAddress,
    from: settings?.config?.email?.from,
    subject: "Reset Your Password",
    template: "reset_password",
    props: {
      email_address: recover_password_options.email_address || recover_password_options?.emailAddress,
      url,
    },
  });

  return reset_token;
};

export default recover_password;
