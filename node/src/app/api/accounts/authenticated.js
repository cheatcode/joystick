import has_login_token_expired from "../../accounts/has_login_token_expired.js";

const authenticated = (req = {}, res = {}) => {
  const login_token_has_expired = has_login_token_expired(
    res,
    req?.cookies?.joystick_login_token,
    req?.cookies?.joystick_login_token_expires_at
  );

  const status = !login_token_has_expired ? 200 : 401;

  return res
    .status(status)
    .send(JSON.stringify({ status, authenticated: !login_token_has_expired }));
};

export default authenticated;
