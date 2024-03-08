import supported_http_methods from "./supported_http_methods.js";
import types from "../../lib/types.js";

const register_route_from_object = (express_app = {}, route_path = '', route_handler = {}) => {
  const method = route_handler?.method?.toLowerCase();
  const methods = route_handler?.methods?.map((method) => method?.toLowerCase());
  const methods_for_route = (method ? [method] : methods)?.filter((method) => {
  	return supported_http_methods.includes(method);
  });
  const middleware_for_route = types.is_array(route_handler?.middleware) ? route_handler?.middleware : [];

  if (methods_for_route?.length === 0) {
  	console.warn(`Cannot register route ${route_path}. All provided HTTP methods are invalid. Must be one of ${supported_http_methods?.join(', ')}.`);
  	return;
  }

  if (!types.is_function(route_handler?.handler)) {
  	console.warn(`Cannot register route ${route_path}. Handler must be a function.`);
  	return;
  }

  for (let i = 0; i < methods_for_route?.length; i += 1) {
  	const method_for_route = methods_for_route[i];
  	express_app[method_for_route](
  		route_path,
  		...(middleware_for_route || []),
  		async (req, res, next) => {
  			route_handler.handler(req, res, next);
  		},
  	);
  }
};

export default register_route_from_object;