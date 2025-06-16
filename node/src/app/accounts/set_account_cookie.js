import set_cookie from "../../lib/set_cookie.js";

const set_account_cookie = (res = null, authentication = null) => {
  if (!res || !authentication) return null;

  set_cookie(res, {
    name: 'joystick_login_token',
    value: authentication.token,
    http_only: true,
    expires_at: authentication.token_expires_at,
  });

  set_cookie(res, {
    name: 'joystick_login_token_expires_at',
    value: authentication.token_expires_at,
    http_only: true,
    expires_at: authentication.token_expires_at,
  });

  return res;
};

export default set_account_cookie;
