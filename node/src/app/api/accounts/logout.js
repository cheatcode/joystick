import accounts from "../../accounts/index.js";
import types from "../../../lib/types.js";

const logout = (req = {}, res = {}) => {
  accounts._unset_account_cookie(res);

  if (
  	types.is_function(process?.joystick?.app_options?.accounts?.events?.onLogout) ||
  	types.is_function(process?.joystick?.app_options?.accounts?.events?.on_logout)
  ) {
    (
      process?.joystick?.app_options?.accounts?.events?.onLogout ||
      process?.joystick?.app_options?.accounts?.events?.on_logout
    )(req?.context?.user);
  }

  res.status(200).send(JSON.stringify({}));
};

export default logout;
