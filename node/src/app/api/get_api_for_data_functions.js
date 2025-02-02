import fetch from 'node-fetch';
import get from "./get.js";
import set from "./set.js";

const get_api_for_data_functions = (req = {}, res= {}, api_schema = {}) => {
	return {
		fetch,
		get: (get_name = '', get_options = {}) => {
			if (get_options?.skip) {
				return null;
			}

			return get({
				get_name,
				get_options, // NOTE: skip, input, output
				getter_definition: api_schema?.getters[get_name],
				request_context: {
					...(req?.context || {}),
					req,
					res,
				},
				api_schema_options: api_schema?.options,
			});
		},
		set: (set_name = '', set_options = {}) => {
			if (set_options?.skip) {
				return null;
			}

			return set({
				set_name,
				set_options, // NOTE: skip, input, output
				setter_definition: api_schema?.setters[set_name],
				request_context: {
					...(req?.context || {}),
					req,
					res,
				},
				api_schema_options: api_schema?.options,
			});
		},
	}
};

export default get_api_for_data_functions;
