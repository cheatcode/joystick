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

export class App {
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
    try {
      const databasesFromEnvironment = parseDatabasesFromEnvironment(
        process.env.databases
      );
  
      const databases = Object.entries(databasesFromEnvironment).map(
        ([databaseName, databaseSettings]) => {
          return {
            name: databaseName,
            settings: databaseSettings,
          };
        }
      );
  
      await Promise.all(
        databases.map(async (database) => {
          if (database.name === "mongodb") {
            const instance = await mongodb(database?.settings?.connection);
            const connection = {
              ...database,
              ...instance,
            };
  
            process.databases = {
              [database.name]: connection.db,
            };
  
            return connection;
          }
        })
      );
  
      return process.databases;
    } catch (exception) {
      console.warn(exception);
    }
  }

  onStartApp(express = {}) {
    // NOTE: Any console.log here is picked up by the stdout listener inside of
    // the start script of the CLI.
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
      if (path && callback && typeof callback === "object") {
        const method = callback.method?.toLowerCase();
        this.express.app[method](path, async (req, res, next) => {
          if (callback.handler) {
            callback.handler(
              Object.assign(req, {
                context: {
                  ...(req?.context || {}),
                  ifLoggedIn: (redirectPath = "", callback = null) => {
                    if (!!req?.context?.user && redirectPath) {
                      return res.redirect(redirectPath);
                    }

                    if (callback) {
                      return callback();
                    }
                  },
                  ifNotLoggedIn: (redirectPath = "", callback = null) => {
                    if (!req?.context?.user && redirectPath) {
                      return res.redirect(redirectPath);
                    }

                    if (callback) {
                      return callback();
                    }
                  },
                  ...(process.databases || {}),
                },
              }),
              res,
              next
            );
          }
        });
      }

      if (path && callback && typeof callback === "function") {
        this.express.app.get(path, (req, res, next) => {
          callback(
            Object.assign(req, {
              context: {
                ...(req?.context || {}),
                ifLoggedIn: (redirectPath = "", callback = null) => {
                  if (!!req?.context?.user && redirectPath) {
                    return res.redirect(redirectPath);
                  }

                  if (callback) {
                    return callback();
                  }
                },
                ifNotLoggedIn: (redirectPath = "", callback = null) => {
                  if (!req?.context?.user && redirectPath) {
                    return res.redirect(redirectPath);
                  }

                  if (callback) {
                    return callback();
                  }
                },
                ...(process.databases || {}),
              },
            }),
            res,
            next
          );
        });
      }
    });
  }

  initAccounts() {
    this.express.app.get("/nonsense", (req, res) => {
      res.send('Terrible');  
    });

    this.express.app.get("/api/_accounts/authenticated", (req, res) => {
      console.log('TEST');
      const loginTokenHasExpired = hasLoginTokenExpired(
        res,
        req?.cookies?.joystickLoginToken,
        req?.cookies?.joystickLoginTokenExpiresAt
      );

      res.status(200).send(JSON.stringify({ status: !loginTokenHasExpired ? 200 : 401, authenticated: !loginTokenHasExpired }));
    });

    this.express.app.post("/api/_accounts/signup", async (req, res) => {
      try {
        const signup = await accounts.signup({
          emailAddress: req?.body?.emailAddress,
          password: req?.body?.password,
          metadata: req?.body?.metadata,
        });

        accounts.setAuthenticationCookie(res, {
          token: signup?.token,
          tokenExpiresAt: signup?.tokenExpiresAt,
        });

        res.status(200).send(JSON.stringify(signup?.user || {}));
      } catch (exception) {
        console.log(exception);
        return res.status(500).send(
          JSON.stringify({
            errors: [formatAPIError(exception, "server")],
          })
        );
      }
    });

    this.express.app.post("/api/_accounts/login", async (req, res) => {
      try {
        const login = await accounts.login({
          emailAddress: req?.body?.emailAddress,
          username: req?.body?.username,
          password: req?.body?.password,
        });

        accounts.setAuthenticationCookie(res, {
          token: login?.token,
          tokenExpiresAt: login?.tokenExpiresAt,
        });

        res.status(200).send(JSON.stringify(login?.user || {}));
      } catch (exception) {
        console.log(exception);
        return res.status(500).send(
          JSON.stringify({
            errors: [formatAPIError(exception, "server")],
          })
        );
      }
    });

    this.express.app.post("/api/_accounts/logout", async (req, res) => {
      try {
        accounts.unsetAuthenticationCookie(res);
        res.status(200).send(JSON.stringify({}));
      } catch (exception) {
        console.log(exception);
        return res.status(500).send(
          JSON.stringify({
            errors: [formatAPIError(exception, "server")],
          })
        );
      }
    });

    this.express.app.post(
      "/api/_accounts/recover-password",
      async (req, res) => {
        try {
          await accounts.recoverPassword({
            emailAddress: req?.body?.emailAddress,
            origin: req?.body?.origin,
          });

          res.status(200).send(JSON.stringify({}));
        } catch (exception) {
          console.log(exception);
          return res.status(500).send(
            JSON.stringify({
              errors: [formatAPIError(exception, "server")],
            })
          );
        }
      }
    );

    this.express.app.post("/api/_accounts/reset-password", async (req, res) => {
      try {
        const reset = await accounts.resetPassword({
          token: req?.body?.token,
          password: req?.body?.password,
        });

        accounts.setAuthenticationCookie(res, {
          token: reset?.token,
          tokenExpiresAt: reset?.tokenExpiresAt,
        });

        res.status(200).send(JSON.stringify(reset?.user || {}));
      } catch (exception) {
        console.log(exception);
        return res.status(500).send(
          JSON.stringify({
            errors: [formatAPIError(exception, "server")],
          })
        );
      }
    });
  }
}

export default (options = {}) => {
  return new Promise(async (resolve) => {
    const app = new App(options);
    await app.start(options);
    return resolve(app.express);
  });
};
