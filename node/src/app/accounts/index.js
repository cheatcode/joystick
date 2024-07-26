import _add_account_session_to_user from "./add_account_session_to_user.js";
import _generate_account_session from "./generate_account_session.js";
import _set_account_cookie from "./set_account_cookie.js";
import _unset_account_cookie from "./unset_account_cookie.js";
import default_user_output_fields from "./default_user_output_fields.js";
import delete_user from './delete_user.js';
import get_browser_safe_user from "./get_browser_safe_user.js";
import login from "./login.js";
import recover_password from "./recover_password.js";
import reset_password from "./reset_password.js";
import roles from "./roles/index.js";
import send_email_verification from "./send_email_verification.js";
import set_password from "./set_password.js";
import signup from "./signup.js";
import verify_email from "./verify_email.js";

const accounts = {
  _add_account_session_to_user,
  _generate_account_session,
  _set_account_cookie,
  _unset_account_cookie,
  default_user_output_fields,
  deleteUser: delete_user,
  delete_user,
  getBrowserSafeUser: get_browser_safe_user,
  get_browser_safe_user,
  login,
  recoverPassword: recover_password,
  recover_password,
  resetPassword: reset_password,
  reset_password,
  roles,
  sendEmailVerification: send_email_verification,
  send_email_verification,
  setPassword: set_password,
  set_password,
  signup,
  verifyEmail: verify_email,
  verify_email,
};

export default accounts;