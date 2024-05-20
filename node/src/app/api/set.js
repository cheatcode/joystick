import format_api_error from "./format_api_error.js";
import get_output from "./get_output.js";
import get_sanitized_context from "../../lib/get_sanitized_context.js";
import sanitize_api_response from "./sanitize_api_response.js";
import track_function_call from "../../test/track_function_call.js";
import types from "../../lib/types.js";
import validate_input from "./validate_input.js";

const run_setter = async (
  set_name = '',
  setter_definition = {},
  input = {},
  output = {},
  context = {},
  api_schema_options = {}
) => {
  const should_disable_sanitization = setter_definition?.sanitize === false;
  const should_sanitize_output = (setter_definition?.sanitize || api_schema_options?.sanitize) === true;

  track_function_call(`node.api.setters.${set_name}`, [
    input,
    get_sanitized_context(context),
  ]);

  const data = (await setter_definition?.set(
    sanitize_api_response(input),
    context
  ));
  const response = output ? get_output(data, output) : data;
  
  return !should_disable_sanitization && should_sanitize_output ? sanitize_api_response(
    response
  ) : response;
};

const run_authorization = async (setter_name = '', setter_definition = {}, input = {}, context = {}) => {
  track_function_call(`node.api.setters.${setter_name}.authorized`, [
    input,
    get_sanitized_context(context),
  ]);

  const authorization = await setter_definition?.authorized(input, context);

  if (typeof authorization === 'boolean') {
    return authorization;
  }

  if (types.is_object(authorization) && !types.is_array(authorization) && !types.is_undefined(authorization?.authorized)) {
    return authorization?.authorized ? true : authorization?.message;
  }
};

const handle_log_validation_errors = (validation_errors = [], setter_name = '') => {
	console.log(
	  `Input validation for setter "${setter_name}" failed with the following errors:\n`
	);

	for (let i = 0; i < validation_errors?.length; i += 1) {
	  const validation_error = validation_errors[i];
	  console.log(`${i + 1}. ${validation_error}`);
	}
};

const run_validation = (set_request_input = {}, setter_definition_input = {}) => {
	return validate_input(set_request_input, setter_definition_input);
};

const set = async ({
	set_name,
	set_options, // NOTE: skip, input, output.
	setter_definition,
	request_context,
	api_schema_options,
}) => {
	const should_run_validation = setter_definition?.input && Object.keys(setter_definition?.input)?.length > 0;
	const should_run_authorization = types.is_function(setter_definition?.authorized);

	if (should_run_validation) {
		const validation_errors = await run_validation(set_options?.input, setter_definition?.input);
		
		if (validation_errors?.length > 0) {
			handle_log_validation_errors(validation_errors, set_name);

		  return Promise.reject({
	      errors: validation_errors.map((error) => {
	        return format_api_error(new Error(error), `setters.${set_name}.input`, 401);
	      }),
	    });
		}
	}

	if (should_run_authorization) {
		const authorized = await run_authorization(set_name, setter_definition, set_options?.input, request_context);

		if (!authorized || types.is_string(authorized)) {
      return Promise.reject({
        errors: [
          format_api_error(
            new Error(typeof authorized === 'string' ? authorized : `Not authorized to access ${set_name}.`),
            `setters.${set_name}.authorized`,
            403
          ),
        ],
      });
		}
	}

	if (types.is_function(setter_definition?.set)) {
		const response = await run_setter(
		  set_name,
		  setter_definition,
		  set_options?.input,
		  set_options?.output,
		  request_context,
		  api_schema_options,
		);

		return Promise.resolve(response);
	}
};

export default set;
