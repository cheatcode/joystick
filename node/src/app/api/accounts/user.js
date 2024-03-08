import default_user_output_fields from "../../accounts/default_user_output_fields.js";
import get_output from "../get_output.js";
import has_login_token_expired from "../../accounts/has_login_token_expired.js";

const user = (req = {}, res = {}) => {
  const login_token_has_expired = has_login_token_expired(
    res,
    req?.cookies?.joystick_login_token,
    req?.cookies?.joystick_login_token_expires_at
  );

  const status = !login_token_has_expired ? 200 : 401;
  const user = get_output(
    req?.context?.user,
    req?.body?.output || default_user_output_fields
  );

  return res.status(status).send(JSON.stringify({ status, user }));
};

export default user;
