import accounts_query from "../../../databases/queries/accounts.js";
import default_user_output_fields from "../../../accounts/default_user_output_fields.js";
import format_api_error from "../../format_api_error.js";
import handle_api_error from "../../handle_api_error.js";
import validate_input from "../../validate_input.js";
import signup from "../../../accounts/signup.js";

const test_accounts_signup = async (req = {}, res = {}) => {
	try {
		// NOTE: Assume accounts created in tests are ephemeral on a per-run basis.
		// When signing up, automatically delete an existing user to avoid fragile
		// tests and conflicts between runs.
		const existing_user_with_email = await accounts_query('user', { email_address: req?.body?.emailAddress || req?.body?.email_address });
		const existing_user_with_username = await accounts_query('user', { username: req?.body?.username });
		const existing_user = existing_user_with_email || existing_user_with_username;

		if (existing_user) {
		  await accounts_query('delete_user', { user_id: existing_user?._id || existing_user?.user_id });
		}

		const metadata_schema = process.joystick?.app_options?.accounts?.signup?.metadata;
		const metadata_errors = metadata_schema ? await validate_input(req?.body?.metadata, metadata_schema) : [];

		if (metadata_errors?.length > 0) {
			return handle_api_error('accounts.signup', {
	      errors: metadata_errors.map((error) => {
	        return format_api_error(new Error(error), `accounts.signup.metadata`, 401);
	      }),
	    }, res);
		}

		const signup_response = await signup({
		  email_address: req?.body?.emailAddress || req?.body?.email_address,
		  username: req?.body?.username,
		  password: req?.body?.password,
		  metadata: req?.body?.metadata,
		  output: req?.body?.output || default_user_output_fields,
		});

		res.status(200).send(JSON.stringify({
		  ...(signup_response?.user || {}),
		  joystick_login_token: signup_response?.token,
		  joystick_login_token_expires_at: signup_response?.token_expires_at,
		}));
	} catch(error) {
		handle_api_error('test.accounts.signup', error, res);
	}
};

export default test_accounts_signup;
