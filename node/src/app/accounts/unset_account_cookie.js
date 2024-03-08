import unset_cookie from "../../lib/unset_cookie.js";

const unset_account_cookie = (res = null) => {
  if (!res) return null;

  unset_cookie('joystick_login_token', res);
  unset_cookie('joystick_login_token_expires_at', res);

  return res;
};

export default unset_account_cookie;
