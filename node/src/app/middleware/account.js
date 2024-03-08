import accounts_query from '../databases/queries/accounts.js';
import has_login_token_expired from '../accounts/has_login_token_expired.js';
import unset_account_cookie from "../accounts/unset_account_cookie.js";

const account_middleware = async (req, res, next) => {
  const login_token_has_expired = has_login_token_expired(
    res,
    req?.cookies?.joystick_login_token,
    req?.cookies?.joystick_login_token_expires_at
  );

  if (login_token_has_expired) {
    unset_account_cookie(res);
  }

  const user = !login_token_has_expired ? await accounts_query("user_with_login_token", {
    token: req?.cookies?.joystick_login_token,
  }) : null;

  req.context = {
    ...(req?.context || {}),
    user,
  };

  next();
};

export default account_middleware;
