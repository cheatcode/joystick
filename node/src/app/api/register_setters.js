import format_api_error from "./format_api_error.js";
import get_api_context from "./get_api_context.js";
import get_api_url_component from "./get_api_url_component.js";
import handle_api_error from "./handle_api_error.js";
import set from "./set.js";
import types from "../../lib/types.js";
import validate_session from "./validate_session.js";

const register_setters = (express_app = {}, setter_definitions = [], api_context = {}, api_schema_options = {}) => {
	for (let i = 0; i < setter_definitions?.length; i += 1) {
		const [setter_name, setter_definition] = setter_definitions[i];
		express_app.post(
			`/api/_setters/${get_api_url_component(setter_name)}`,
      ...(types.is_array(setter_definition?.middleware) ? setter_definition?.middleware : []),
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

        // NOTE: No need for URL decoding or JSON integrity check like getters as these are passed
        // via the body, not query parameters.
        const input = req?.body?.input || null;
        const output = req?.body?.output || null;

				set({
					set_name: setter_name,
					set_options: {
						input,
						output,
					},
					setter_definition,
					request_context: context,
					api_schema_options,
				}).then((response) => {
          return res.status(200).send(JSON.stringify(response));
        }).catch((error) => {
        	handle_api_error(`api.setters.${setter_name}`, error, res);
        });
      },
		);

		// express_app.post('/api/_setters/:setter_name', (req = {}, res = {}) => {
		// 	// NOTE: This works because it comes after the explicit registrations above.
		// 	return res.status(404).send(
		// 		JSON.stringify({
		// 			errors: [format_api_error(new Error(`Setter ${req?.params?.setter_name} not found`))],
		// 		})
		// 	);
		// });
	}
};

export default register_setters;
	