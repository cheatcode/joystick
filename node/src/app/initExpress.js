import express from "express";
import https from "https";
import middleware from "./middleware/index.js";
import getSSLCertificates from "../lib/getSSLCertificates.js";

export default (onInit = () => {}, options = {}, appInstance = {}) => {
  try {
    const ssl = getSSLCertificates(options?.ssl);
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 2600;

    // NOTE: Reassign process.env in case we fell back to default port.
    process.env.PORT = port;

    const app = express();
    const server = ssl
      ? https.createServer(ssl, app).listen(port)
      : app.listen(port);

    const config = joystick?.settings?.config || {};

    middleware({
      app,
      port,
      middlewareConfig: config?.middleware,
      appInstance,
      cspConfig: options?.csp,
    });

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
      onInit(instance, appInstance);
    }

    return instance;
  } catch (exception) {
    console.warn(exception);
  }
};
