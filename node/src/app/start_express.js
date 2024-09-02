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
 
  // NOTE: Bind the app to localhost in production environments to avoid exposing the app
  // to the world via the host machine's IP address.
  const host = process.env.NODE_ENV !== 'development' ? '127.0.0.1' : '0.0.0.0';
  const server = express_app.listen(port, host);

  built_in_middleware({
    app_instance,
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

