import format_api_error from "./format_api_error.js";
import get from "./get.js";
import get_api_context from "./get_api_context.js";
import get_api_url_component from "./get_api_url_component.js";
import handle_api_error from "./handle_api_error.js";
import is_valid_json from "../../lib/is_valid_json.js";
import types from "../../lib/types.js";
import validate_session from "./validate_session.js";

const register_getters = (express_app = {}, getter_definitions = [], api_context = {}, api_schema_options = {}) => {
	for (let i = 0; i < getter_definitions?.length; i += 1) {
		const [getter_name, getter_definition] = getter_definitions[i];
		express_app.get(
			`/api/_getters/${get_api_url_component(getter_name)}`,
      ...(types.is_array(getter_definition?.middleware) ? getter_definition?.middleware : []),
      async (req = {}, res = {}) => {
      	if (process.databases?._sessions) {
	        const is_valid_session = await validate_session(req, res);

	        if (!is_valid_session) {
				    return res.status(403).send(
				      JSON.stringify({
				        errors: [format_api_error(new Error('Unauthorized request.'))],
				      })
				    );
	        }
      	}

        const context = await get_api_context(req, res, api_context);
        
        const decoded_input = decodeURIComponent(req?.query?.input);
        const input = is_valid_json(decoded_input) ? JSON.parse(decoded_input) : null;

        const decoded_output = decodeURIComponent(req?.query?.output);
        const output = is_valid_json(decoded_output) ? JSON.parse(decoded_output) : null;

				get({
					get_name: getter_name,
					get_options: {
						input,
						output,
					},
					getter_definition,
					request_context: context,
					api_schema_options,
				}).then((response) => {
          return res.status(200).send(JSON.stringify(response));
        }).catch((error) => {
        	handle_api_error(`api.getters.${getter_name}`, error, res);
        });
      },
		);
	}
};

export default register_getters;
	