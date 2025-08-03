import express from "express";
import https from "https";
import built_in_middleware from "./middleware/built_in.js";
import get_joystick_build_path from "../lib/get_joystick_build_path.js";
import types from "../lib/types.js";

const start_express = (on_after_start_server = null, app_instance = {}) => {
  const config = joystick?.settings?.config || {};
  const joystick_build_path = get_joystick_build_path();
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 2600;

  // NOTE: Reassign process.env in case we fell back to default port.
  process.env.PORT = port;

  const express_app = express();

  // NOTE: Offer a hook for tooling that needs immediate access to the Express
  // app instance (e.g., APM services).
  if (typeof app_instance?.options?.express?.on_after_create_app === 'function') {
    app_instance.options.express.on_after_create_app(express_app);
  }

  // NOTE: Bind the app to 0.0.0.0 so instance is always directly accessible via IP. This is safe
  // in production as the insecure_middleware() ensures the connection is made over HTTPS.
  const server = express_app.listen(port, '0.0.0.0');

  built_in_middleware({
    app_instance,
    mod: app_instance?.mod,
    csp_config: app_instance?.options?.csp,
  	express_app,
  	joystick_build_path,
    middleware_config: config?.middleware,
    port,
  });

  if (app_instance?.options?.middleware && types.is_array(app_instance?.options?.middleware)) {
  	for (let i = 0; i < app_instance?.options?.middleware?.length; i += 1) {
  		const middleware_to_run = app_instance?.options?.middleware[i];
  		express_app.use(middleware_to_run);
  	}
  }

  const instance = {
    port,
    app: express_app,
    server,
  };

  if (types.is_function(on_after_start_server)) {
    on_after_start_server(instance, app_instance);
  }

  return instance;
};

export default start_express;

