import accounts from "../../accounts/index.js";
import default_user_output_fields from "../../accounts/default_user_output_fields.js";
import handle_api_error from '../handle_api_error.js';

const login = async (req = {}, res = {}) => {
  try {
    const login = await accounts.login({
      email_address: req?.body?.emailAddress || req?.body?.email_address,
      username: req?.body?.username,
      password: req?.body?.password,
      output: req?.body?.output || default_user_output_fields,
    });

    if (process.env.NODE_ENV !== 'test') {
      accounts._set_account_cookie(res, {
        token: login?.token,
        token_expires_at: login?.token_expires_at || login?.tokenExpiresAt,
      });
    }

    const response = {
      ...(login?.user || {}),
    };

    if (process.env.NODE_ENV === 'test') {
      response.joystick_token = login?.token;
      response.joystick_login_token_expires_at = login?.token_expires_at;
    }

    res.status(200).send(JSON.stringify(response));
  } catch(error) {
    handle_api_error('accounts.login', error, res);
  }
};

export default login;
