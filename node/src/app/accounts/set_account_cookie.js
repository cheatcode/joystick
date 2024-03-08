import set_cookie from "../../lib/set_cookie.js";

const set_account_cookie = (res = null, authentication = null) => {
  if (!res || !authentication) return null;

  set_cookie(res, 'joystick_login_token', authentication.token, authentication.token_expires_at);
  set_cookie(res, 'joystick_login_token_expires_at', authentication.token_expires_at, authentication.token_expires_at);

  return res;
};

export default set_account_cookie;
