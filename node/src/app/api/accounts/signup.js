import accounts from "../../accounts/index.js";
import default_user_output_fields from "../../accounts/default_user_output_fields.js";
import format_api_error from "../format_api_error.js";
import handle_api_error from "../handle_api_error.js";
import validate_input from "../validate_input.js";

const signup = async (req = {}, res = {}) => {
	try {
		const metadata_schema = process.joystick?.app_options?.accounts?.signup?.metadata;
		const metadata_errors = metadata_schema ? await validate_input(req?.body?.metadata, metadata_schema) : [];

		if (metadata_errors?.length > 0) {
			return handle_api_error('accounts.signup', {
	      errors: metadata_errors.map((error) => {
	        return format_api_error(new Error(error), `accounts.signup.metadata`, 401);
	      }),
	    }, res);
		}

		const signup = await accounts.signup({
		  email_address: req?.body?.emailAddress || req?.body?.email_address,
		  password: req?.body?.password,
		  metadata: req?.body?.metadata,
		  output: req?.body?.output || default_user_output_fields,
		});

		if (process.env.NODE_ENV !== 'test') {
		  accounts._set_account_cookie(res, {
		    token: signup?.token,
		    token_expires_at: signup?.token_expires_at,
		  });
		}

		const response = {
		  ...(signup?.user || {}),
		};

		if (process.env.NODE_ENV === 'test') {
		  response.joystick_token = signup?.token;
		  response.joystick_login_token_expires_at = signup?.token_expires_at;
		}

		res.status(200).send(JSON.stringify(response));
	} catch(error) {
		handle_api_error('accounts.signup', error, res);
	}
};

export default signup;
