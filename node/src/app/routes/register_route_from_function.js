const register_route_from_function = (express_app = {}, route_path = '', route_handler = null) => {
	express_app.get(
		route_path,
		async (req, res, next) => {
			route_handler(req, res, next);
		},
	);
};

export default register_route_from_function;