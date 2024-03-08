import accounts from "../../accounts/index.js";
import default_user_output_fields from "../../accounts/default_user_output_fields.js";
import handle_api_error from "../handle_api_error.js";

const reset_password = async (req = {}, res = {}) => {
	try {
		const reset = await accounts.reset_password({
		  token: req?.body?.token,
		  password: req?.body?.password,
		  output: req?.body?.output || default_user_output_fields,
		});

		accounts._set_account_cookie(res, {
		  token: reset?.token,
		  token_expires_at: reset?.token_expires_at,
		});

		res.status(200).send(JSON.stringify(reset?.user || {}));
  } catch(error) {
    handle_api_error('accounts.reset_password', error, res);
  }
};

export default reset_password;
