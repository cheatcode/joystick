const register_app_options = (app_instance = {}, app_options = {}) => {
	app_instance.databases = [];
  app_instance.express = {};
	app_instance.options = app_options;
};

export default register_app_options;
