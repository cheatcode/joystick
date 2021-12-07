import initExpress from "./initExpress.js";
import handleProcessErrors from "./handleProcessErrors";
import registerGetters from "./registerGetters.js";
import registerSetters from "./registerSetters.js";
import parseDatabasesFromEnvironment from "../lib/parseDatabasesFromEnvironment.js";
import mongodb from "./databases/mongodb/index.js";
import accounts from "./accounts";
import formatAPIError from "../lib/formatAPIError";
import hasLoginTokenExpired from "./accounts/hasLoginTokenExpired.js";
import { isObject } from "../validation/lib/typeValidators.js";
import isValidHTTPMethod from "../lib/isValidHTTPMethod.js";
import supportedHTTPMethods from "../lib/supportedHTTPMethods.js";
import log from "../lib/log.js";
process.setMaxListeners(0);
class App {
  constructor(options = {}) {
    handleProcessErrors(options?.events);
    this.databases = [];
    this.express = {};
  }
  async start(options = {}) {
    this.databases = await this.loadDatabases();
    this.express = initExpress(this.onStartApp, options);
    this.initAccounts();
    this.initAPI(options?.api);
    this.initRoutes(options?.routes);
  }
  async loadDatabases(callback) {
    const databasesFromEnvironment = parseDatabasesFromEnvironment(process.env.databases);
    const databases = Object.entries(databasesFromEnvironment).map(([databaseName, databaseSettings]) => {
      return {
        name: databaseName,
        settings: databaseSettings
      };
    });
    await Promise.all(databases.map(async (database) => {
      if (database.name === "mongodb") {
        const instance = await mongodb(database?.settings?.connection);
        const connection = {
          ...database,
          ...instance
        };
        process.databases = {
          [database.name]: connection.db
        };
        return connection;
      }
    }));
    return process.databases;
  }
  onStartApp(express = {}) {
    process.on("message", (message) => {
      process.BUILD_ERROR = JSON.parse(message);
    });
    console.log(`App running at: http://localhost:${express.port}`);
  }
  initAPI(api = {}) {
    const context = api?.context;
    const getters = api?.getters;
    const setters = api?.setters;
    if (getters && isObject(getters) && Object.keys(getters).length > 0) {
      registerGetters(this.express, Object.entries(getters), context);
    }
    if (setters && isObject(setters) && Object.keys(setters).length > 0) {
      registerSetters(this.express, Object.entries(setters), context);
    }
  }
  initRoutes(routes = {}) {
    Object.entries(routes).forEach(([path, callback]) => {
      const isObjectBasedRoute = path && callback && typeof callback === "object";
      const isFunctionBasedRoute = path && callback && typeof callback === "function";
      const method = callback?.method?.toLowerCase();
      const isValidMethod = method && isValidHTTPMethod(method) || false;
      const isValidHandler = isFunctionBasedRoute && typeof callback === "function" || isObjectBasedRoute && callback && callback.handler && typeof callback.handler === "function";
      if (isFunctionBasedRoute && !isValidHandler) {
        log(`Cannot register route ${path}. When defining a route using the function-based pattern, route must be set to a function.`, {
          level: "danger",
          docs: "https://github.com/cheatcode/joystick#defining-routes"
        });
      }
      if (isObjectBasedRoute && !isValidHandler) {
        log(`Cannot register route ${path}. When defining a route using the object-based pattern, the handler property must be set to a function.`, {
          level: "danger",
          docs: "https://github.com/cheatcode/joystick#defining-routes-for-specific-http-methods"
        });
      }
      if (isObjectBasedRoute && !method || isObjectBasedRoute && method && !isValidMethod) {
        log(`Cannot register route ${path}. When defining a route using the object-based pattern, the method property must be set to a valid HTTP method: ${supportedHTTPMethods.join(", ")}.`, {
          level: "danger",
          docs: "https://github.com/cheatcode/joystick#defining-routes-for-specific-http-methods"
        });
      }
      if (isObjectBasedRoute && callback && !callback.handler) {
        log(`Cannot register route ${path}. When defining a route using the object-based pattern, the handler property must be set to a function.`, {
          level: "danger",
          docs: "https://github.com/cheatcode/joystick#defining-routes-for-specific-http-methods"
        });
      }
      if (isObjectBasedRoute && method && isValidMethod && callback && callback.handler) {
        this.express.app[method](path, async (req, res, next) => {
          callback.handler(Object.assign(req, {
            context: {
              ...req?.context || {},
              ifLoggedIn: (redirectPath = "", callback2 = null) => {
                if (!!req?.context?.user && redirectPath) {
                  return res.redirect(redirectPath);
                }
                if (callback2) {
                  return callback2();
                }
              },
              ifNotLoggedIn: (redirectPath = "", callback2 = null) => {
                if (!req?.context?.user && redirectPath) {
                  return res.redirect(redirectPath);
                }
                if (callback2) {
                  return callback2();
                }
              },
              ...process.databases || {}
            }
          }), res, next);
        });
      }
      if (isFunctionBasedRoute) {
        this.express.app.get(path, (req, res, next) => {
          callback(Object.assign(req, {
            context: {
              ...req?.context || {},
              ifLoggedIn: (redirectPath = "", callback2 = null) => {
                if (!!req?.context?.user && redirectPath) {
                  return res.redirect(redirectPath);
                }
                if (callback2) {
                  return callback2();
                }
              },
              ifNotLoggedIn: (redirectPath = "", callback2 = null) => {
                if (!req?.context?.user && redirectPath) {
                  return res.redirect(redirectPath);
                }
                if (callback2) {
                  return callback2();
                }
              },
              ...process.databases || {}
            }
          }), res, next);
        });
      }
    });
  }
  initAccounts() {
    this.express.app.get("/api/_accounts/authenticated", async (req, res) => {
      const loginTokenHasExpired = await hasLoginTokenExpired(res, req?.cookies?.joystickLoginToken, req?.cookies?.joystickLoginTokenExpiresAt);
      const status = !loginTokenHasExpired ? 200 : 401;
      return res.status(status).send(JSON.stringify({ status, authenticated: !loginTokenHasExpired }));
    });
    this.express.app.post("/api/_accounts/signup", async (req, res) => {
      try {
        const signup = await accounts.signup({
          emailAddress: req?.body?.emailAddress,
          password: req?.body?.password,
          metadata: req?.body?.metadata
        });
        accounts.setAuthenticationCookie(res, {
          token: signup?.token,
          tokenExpiresAt: signup?.tokenExpiresAt
        });
        res.status(200).send(JSON.stringify(signup?.user || {}));
      } catch (exception) {
        console.log(exception);
        return res.status(500).send(JSON.stringify({
          errors: [formatAPIError(exception, "server")]
        }));
      }
    });
    this.express.app.post("/api/_accounts/login", async (req, res) => {
      try {
        const login = await accounts.login({
          emailAddress: req?.body?.emailAddress,
          username: req?.body?.username,
          password: req?.body?.password
        });
        accounts.setAuthenticationCookie(res, {
          token: login?.token,
          tokenExpiresAt: login?.tokenExpiresAt
        });
        res.status(200).send(JSON.stringify(login?.user || {}));
      } catch (exception) {
        console.log(exception);
        return res.status(500).send(JSON.stringify({
          errors: [formatAPIError(exception, "server")]
        }));
      }
    });
    this.express.app.post("/api/_accounts/logout", async (req, res) => {
      try {
        accounts.unsetAuthenticationCookie(res);
        res.status(200).send(JSON.stringify({}));
      } catch (exception) {
        console.log(exception);
        return res.status(500).send(JSON.stringify({
          errors: [formatAPIError(exception, "server")]
        }));
      }
    });
    this.express.app.post("/api/_accounts/recover-password", async (req, res) => {
      try {
        await accounts.recoverPassword({
          emailAddress: req?.body?.emailAddress,
          origin: req?.body?.origin
        });
        res.status(200).send(JSON.stringify({}));
      } catch (exception) {
        console.log(exception);
        return res.status(500).send(JSON.stringify({
          errors: [formatAPIError(exception, "server")]
        }));
      }
    });
    this.express.app.post("/api/_accounts/reset-password", async (req, res) => {
      try {
        const reset = await accounts.resetPassword({
          token: req?.body?.token,
          password: req?.body?.password
        });
        accounts.setAuthenticationCookie(res, {
          token: reset?.token,
          tokenExpiresAt: reset?.tokenExpiresAt
        });
        res.status(200).send(JSON.stringify(reset?.user || {}));
      } catch (exception) {
        console.log(exception);
        return res.status(500).send(JSON.stringify({
          errors: [formatAPIError(exception, "server")]
        }));
      }
    });
  }
}
var app_default = (options = {}) => {
  return new Promise(async (resolve) => {
    const app = new App(options);
    await app.start(options);
    return resolve(app.express);
  });
};
export {
  App,
  app_default as default
};
