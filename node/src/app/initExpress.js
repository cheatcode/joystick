import express from "express";
import middleware from "./middleware/index.js";

export default (onInit = () => {}, options = {}) => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 2600;

    // NOTE: Reassing process.env in case we fell back to default port.
    process.env.PORT = port;

    const app = express();
    const server = app.listen(port);
    const config = joystick?.settings?.config || {};

    middleware(app, port, config?.middleware);

    if (options?.middleware && options?.middleware instanceof Array) {
      options.middleware.forEach((middleware) => {
        app.use(middleware);
      });
    }

    const instance = {
      port,
      app,
      server,
    };

    if (onInit) {
      onInit(instance);
    }

    return instance;
  } catch (exception) {
    console.warn(exception);
  }
};
