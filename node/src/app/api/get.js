import format_api_error from "./format_api_error.js";
import get_output from "./get_output.js";
import get_sanitized_context from "../../lib/get_sanitized_context.js";
import sanitize_api_response from "./sanitize_api_response.js";
import track_function_call from "../../test/track_function_call.js";
import types from "../../lib/types.js";
import validate_input from "./validate_input.js";

const run_getter = async (
  get_name = '',
  getter_definition = {},
  input = null,
  output = null,
  context = {},
  api_schema_options = {}
) => {
  const should_disable_sanitization = getter_definition?.sanitize === false;
  const should_sanitize_output = (getter_definition?.sanitize || api_schema_options?.sanitize) === true;

  track_function_call(`node.api.getters.${get_name}`, [
    input,
    get_sanitized_context(context),
  ]);

  const data = (await getter_definition?.get(input, context));
  const response = output ? get_output(data, output) : data;
  
  const sanitized_response = !should_disable_sanitization && should_sanitize_output ? sanitize_api_response(
    response
  ) : response;

  console.log({
    data,
    response,
    sanitized_response,
  });

  return sanitized_response;
};

const run_authorization = async (getter_name = '', getter_definition = {}, input = {}, context = {}) => {
  track_function_call(`node.api.getters.${getter_name}.authorized`, [
    input,
    get_sanitized_context(context),
  ]);

  const authorization = await getter_definition?.authorized(input, context);

  if (typeof authorization === 'boolean') {
    return authorization;
  }

  if (types.is_object(authorization) && !types.is_array(authorization) && !types.is_undefined(authorization?.authorized)) {
    return authorization?.authorized ? true : authorization?.message;
  }
};

const handle_log_validation_errors = (validation_errors = [], getter_name = '') => {
	console.log(
	  `Input validation for getter "${getter_name}" failed with the following errors:\n`
	);

	for (let i = 0; i < validation_errors?.length; i += 1) {
	  const validation_error = validation_errors[i];
	  console.log(`${i + 1}. ${validation_error}`);
	}
};

const run_validation = (get_request_input = {}, getter_definition_input = {}) => {
	return validate_input(get_request_input, getter_definition_input);
};

const get = async ({
	get_name,
	get_options, // NOTE: skip, input, output.
	getter_definition,
	request_context,
	api_schema_options,
}) => {
	const should_run_validation = getter_definition?.input && Object.keys(getter_definition?.input)?.length > 0;
	const should_run_authorization = types.is_function(getter_definition?.authorized);

	if (should_run_validation) {
		const validation_errors = await run_validation(get_options?.input, getter_definition?.input);

		if (validation_errors?.length > 0) {
			handle_log_validation_errors(validation_errors, get_name);

		  return Promise.reject({
	      errors: validation_errors.map((error) => {
	        return format_api_error(new Error(error), `getters.${get_name}.input`, 400);
	      }),
	    });
		}
	}

	if (should_run_authorization) {
		const authorized = await run_authorization(get_name, getter_definition, get_options?.input, request_context);

		if (!authorized || types.is_string(authorized)) {
      return Promise.reject({
        errors: [
          format_api_error(
            new Error(typeof authorized === 'string' ? authorized : `Not authorized to access ${get_name}.`),
            `getters.${get_name}.authorized`,
            403
          ),
        ],
      });
		}
	}

	if (types.is_function(getter_definition?.get)) {
		const response = await run_getter(
		  get_name,
		  getter_definition,
		  get_options?.input,
		  get_options?.output,
		  request_context,
		  api_schema_options,
		);

		return Promise.resolve(response);
	}
};

export default get;
