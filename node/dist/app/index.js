import fs from "fs";
import aws from "aws-sdk";
import EventEmitter from "events";
import * as WebSocket from "ws";
import queryString from "query-string";
import multer from "multer";
import cron from "node-cron";
import { execSync } from "child_process";
import initExpress from "./initExpress.js";
import handleProcessErrors from "./handleProcessErrors";
import registerGetters from "./registerGetters.js";
import registerSetters from "./registerSetters.js";
import connectMongoDB from "./databases/mongodb/index.js";
import connectPostgreSQL from "./databases/postgresql/index.js";
import accounts from "./accounts";
import formatAPIError from "../lib/formatAPIError";
import hasLoginTokenExpired from "./accounts/hasLoginTokenExpired.js";
import { isObject } from "../validation/lib/typeValidators.js";
import supportedHTTPMethods from "../lib/supportedHTTPMethods.js";
import getAPIURLComponent from "./getAPIURLComponent";
import validateUploaderOptions from "./validateUploaderOptions.js";
import log from "../lib/log.js";
import validateUploads from "./validateUploads";
import runUploader from "./runUploader";
import generateId from "../lib/generateId.js";
import getOutput from "./getOutput.js";
import defaultUserOutputFields from "./accounts/defaultUserOutputFields.js";
import createPostgreSQLAccountsTables from "./databases/postgresql/createAccountsTables";
import createPostgreSQLAccountsIndexes from "./databases/postgresql/createAccountsIndexes";
import loadSettings from "../settings/load.js";
import Queue from "./queues/index.js";
import readDirectory from "../lib/readDirectory.js";
import getBuildPath from "../lib/getBuildPath.js";
import generateMachineId from "../lib/generateMachineId.js";
import emitWebsocketEvent from "../websockets/emitWebsocketEvent.js";
process.setMaxListeners(0);
class App {
  constructor(options = {}) {
    this.setMachineId();
    this.setJoystickProcessId();
    handleProcessErrors(options?.events);
    this.databases = [];
    this.express = {};
    this.options = options || {};
  }
  async start(options = {}) {
    await this.invalidateCache();
    this.databases = await this.loadDatabases();
    this.express = initExpress(this.onStartApp, options);
    this.initWebsockets(options?.websockets || {});
    this.initAccounts();
    this.initDeploy();
    this.initAPI(options?.api);
    this.initRoutes(options?.routes);
    this.initUploaders(options?.uploaders);
    this.initFixtures(options?.fixtures);
    this.initQueues(options?.queues);
    this.initCronJobs(options?.cronJobs);
    if (process.env.NODE_ENV === "development") {
      process.on("message", (message) => {
        const parsedMessage = JSON.parse(message);
        if (parsedMessage?.type === " RESTART_SERVER") {
          this.express?.server?.close();
        }
      });
    }
  }
  async invalidateCache() {
    const uiFiles = fs.existsSync(`${getBuildPath()}ui`) ? await readDirectory(`${getBuildPath()}ui`) : [];
    const cacheFiles = uiFiles?.filter((filePath) => filePath?.includes("_cache"));
    for (let i = 0; i < cacheFiles?.length; i += 1) {
      await fs.promises.unlink(cacheFiles[i]);
    }
    return Promise.resolve();
  }
  async loadDatabases(callback) {
    const settings = loadSettings();
    const databases = settings?.config?.databases?.map((database) => {
      return {
        provider: database?.provider,
        settings: database
      };
    });
    for (let databaseIndex = 0; databaseIndex < databases?.length; databaseIndex += 1) {
      const database = databases[databaseIndex];
      if (database?.provider === "mongodb") {
        const mongodb = await connectMongoDB(database?.settings, databaseIndex);
        process.databases = {
          ...process.databases || {},
          mongodb
        };
      }
      if (database?.provider === "postgresql") {
        const postgresql = await connectPostgreSQL(database?.settings, databaseIndex);
        process.databases = {
          ...process.databases || {},
          postgresql: {
            ...postgresql?.pool,
            query: postgresql?.query
          }
        };
        if (postgresql?.query) {
          await createPostgreSQLAccountsTables();
          await createPostgreSQLAccountsIndexes();
        }
      }
    }
    return process.databases;
  }
  onStartApp(express = {}) {
    process.on("message", (message) => {
      process.BUILD_ERROR = JSON.parse(message);
    });
    console.log(`App running at: http://localhost:${express.port}`);
  }
  setMachineId() {
    generateMachineId();
  }
  setJoystickProcessId() {
    if (!fs.existsSync("./.joystick")) {
      fs.mkdirSync("./.joystick");
    }
    if (!fs.existsSync("./.joystick/PROCESS_ID")) {
      fs.writeFileSync("./.joystick/PROCESS_ID", `${generateId(32)}`);
    }
  }
  initDeploy() {
    if (process.env.NODE_ENV === "production" && process.env.IS_PUSH_DEPLOYED) {
      this.express.app.get("/api/_push/pre-version", async (req, res) => {
        const instanceToken = fs.readFileSync("/root/token.txt", "utf-8");
        if (req?.headers["x-instance-token"] === instanceToken?.replace("\n", "")) {
          if (this.options?.events?.onBeforeDeployment && typeof this.options?.events?.onBeforeDeployment === "function") {
            await this.options.events.onBeforeDeployment(req?.query?.instance || "", req?.query?.version);
            return res.status(200).send("ok");
          }
          return res.status(200).send("ok");
        }
        return res.status(403).send("Sorry, you must pass a valid instance token to access this endpoint.");
      });
      this.express.app.get("/api/_push/health", async (req, res) => {
        const instanceToken = fs.readFileSync("/root/token.txt", "utf-8");
        if (req?.headers["x-instance-token"] === instanceToken?.replace("\n", "")) {
          return res.status(200).send("ok");
        }
        return res.status(403).send("Sorry, you must pass a valid instance token to access this endpoint.");
      });
      this.express.app.get("/api/_push/logs", async (req, res) => {
        const instanceToken = fs.readFileSync("/root/token.txt", "utf-8");
        if (req?.headers["x-instance-token"] === instanceToken?.replace("\n", "")) {
          const logs = execSync(`export NODE_ENV=production && instance logs${req?.query?.before ? ` --before ${req?.query?.before}` : ""}${req?.query?.after ? ` --after ${req?.query?.after}` : ""}`);
          return res.status(200).send(logs);
        }
        return res.status(403).send("Sorry, you must pass a valid instance token to access this endpoint.");
      });
      this.express.app.get("/api/_push/metrics", async (req, res) => {
        const instanceToken = fs.readFileSync("/root/token.txt", "utf-8");
        if (req?.headers["x-instance-token"] === instanceToken?.replace("\n", "")) {
          const metrics = execSync(`export NODE_ENV=production && instance metrics`);
          return res.status(200).send(metrics);
        }
        return res.status(403).send("Sorry, you must pass a valid instance token to access this endpoint.");
      });
    }
  }
  initAPI(api = {}) {
    const getters = api?.getters;
    const setters = api?.setters;
    const options = api?.options;
    const context = api?.context;
    if (getters && isObject(getters) && Object.keys(getters).length > 0) {
      registerGetters(this.express, Object.entries(getters), context, options);
    }
    if (setters && isObject(setters) && Object.keys(setters).length > 0) {
      registerSetters(this.express, Object.entries(setters), context, options);
    }
  }
  initRoutes(routes = {}) {
    Object.entries(routes).forEach(([path, callback]) => {
      const isObjectBasedRoute = path && callback && typeof callback === "object";
      const isFunctionBasedRoute = path && callback && typeof callback === "function";
      const method = callback?.method?.toLowerCase();
      const methods = callback?.methods?.map((method2) => method2?.toLowerCase());
      const methodsForRoute = method ? [method] : methods;
      const invalidMethods = isObjectBasedRoute ? methodsForRoute.filter((method2) => !supportedHTTPMethods.includes(method2)) : [];
      const isValidMethod = Array.isArray(methodsForRoute) && invalidMethods.length === 0;
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
      if (isObjectBasedRoute && invalidMethods.length > 0) {
        log(`Cannot register route ${path}. When defining a route using the object-based pattern, you can only set method (single HTTP method as a string) or methods (array of HTTP methods as strings), not both.`, {
          level: "danger",
          docs: "https://github.com/cheatcode/joystick#defining-routes-for-specific-http-methods"
        });
      }
      if (isObjectBasedRoute && method && methods) {
        log(`Cannot register route ${path}. When defining a route using the object-based pattern, you can only set method (single HTTP method as a string) or methods (array of HTTP methods as strings), not both.`, {
          level: "danger",
          docs: "https://github.com/cheatcode/joystick#defining-routes-for-specific-http-methods"
        });
      }
      if (isObjectBasedRoute && !method && !methods) {
        log(`Cannot register route ${path}. When defining a route using the object-based pattern, you must pass a method (single HTTP method as a string) or methods (array of HTTP methods as strings) for the route.`, {
          level: "danger",
          docs: "https://github.com/cheatcode/joystick#defining-routes-for-specific-http-methods"
        });
      }
      if (isObjectBasedRoute && method && !isValidMethod) {
        log(`Cannot register route ${path}. When defining a route using the object-based pattern, the method property must be set to a valid HTTP method: ${supportedHTTPMethods.join(", ")}.`, {
          level: "danger",
          docs: "https://github.com/cheatcode/joystick#defining-routes-for-specific-http-methods"
        });
      }
      if (isObjectBasedRoute && methods && !isValidMethod) {
        log(`Cannot register route ${path}. When defining a route using the object-based pattern, the methods property must be set to an array of valid HTTP methods: ${supportedHTTPMethods.join(", ")}.`, {
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
      if (isObjectBasedRoute && methodsForRoute && isValidMethod && callback && callback.handler) {
        methodsForRoute.forEach((method2) => {
          this.express.app[method2](path, ...[
            ...Array.isArray(callback?.middleware) ? callback?.middleware : [],
            async (req, res, next) => {
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
            }
          ]);
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
  initWebsockets(userWebsockets = {}) {
    const websocketServers = {
      uploaders: {
        server: new WebSocket.WebSocketServer({
          noServer: true,
          path: "/api/_websockets/uploaders"
        })
      },
      ...Object.entries(userWebsockets).reduce((definitions = {}, [userWebsocketName, userWebsocketDefinition]) => {
        definitions[userWebsocketName] = {
          server: new WebSocket.WebSocketServer({
            noServer: true,
            path: `/api/_websockets/${userWebsocketName}`
          }),
          onOpen: userWebsocketDefinition?.onOpen || null,
          onMessage: userWebsocketDefinition?.onMessage || null,
          onClose: userWebsocketDefinition?.onClose || null
        };
        return definitions;
      }, {})
    };
    Object.entries(websocketServers).forEach(([websocketName, websocketDefinition]) => {
      websocketDefinition.server.on("connection", function connection(websocketConnection, connectionRequest) {
        try {
          const [_path, params] = connectionRequest?.url?.split("?");
          const connectionParams = queryString.parse(params);
          const emitter = new EventEmitter();
          const emitterId = connectionParams?.id ? `${websocketName}_${connectionParams?.id}` : websocketName;
          if (joystick?.emitters[emitterId]) {
            joystick.emitters[emitterId].push(emitter);
          } else {
            joystick.emitters = {
              ...joystick?.emitters || {},
              [emitterId]: [emitter]
            };
          }
          const connection2 = Object.assign(websocketConnection, {
            params: connectionParams
          });
          if (websocketDefinition?.onOpen) {
            websocketDefinition.onOpen(connection2);
          }
          websocketConnection.on("message", (message) => {
            const parsedMessage = JSON.parse(message);
            if (websocketDefinition.onMessage) {
              websocketDefinition.onMessage(parsedMessage, connection2);
            }
          });
          websocketConnection.on("close", (code = 0, reason = "") => {
            if (websocketDefinition?.onClose) {
              websocketDefinition.onClose(code, reason?.toString(), connection2);
            }
          });
          emitter.on("message", (message = {}) => {
            websocketConnection.send(JSON.stringify(message));
          });
          emitter.on("progress", (progress = {}) => {
            websocketConnection.send(JSON.stringify({ type: "PROGRESS", ...progress }));
          });
        } catch (exception) {
          console.warn(exception);
        }
      });
    });
    this.express.server.on("upgrade", (request, socket, head) => {
      if (!request?.url?.includes("/api/_websockets/")) {
        return;
      }
      const websocketName = (request?.url?.replace("/api/_websockets/", "").split("?") || [])[0];
      const websocket = websocketServers[websocketName];
      if (websocket) {
        websocket.server.handleUpgrade(request, socket, head, (socket2) => {
          websocket.server.emit("connection", socket2, request);
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
    this.express.app.get("/api/_accounts/user", async (req, res) => {
      const loginTokenHasExpired = await hasLoginTokenExpired(res, req?.cookies?.joystickLoginToken, req?.cookies?.joystickLoginTokenExpiresAt);
      const status = !loginTokenHasExpired ? 200 : 401;
      const user = getOutput(req?.context?.user, req?.body?.output || defaultUserOutputFields);
      return res.status(status).send(JSON.stringify({ status, user }));
    });
    this.express.app.post("/api/_accounts/signup", async (req, res) => {
      try {
        const signup = await accounts.signup({
          emailAddress: req?.body?.emailAddress,
          password: req?.body?.password,
          metadata: req?.body?.metadata,
          output: req?.body?.output || defaultUserOutputFields
        });
        accounts._setAuthenticationCookie(res, {
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
          password: req?.body?.password,
          output: req?.body?.output || defaultUserOutputFields
        });
        accounts._setAuthenticationCookie(res, {
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
        accounts._unsetAuthenticationCookie(res);
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
          emailAddress: req?.body?.emailAddress
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
          password: req?.body?.password,
          output: req?.body?.output || defaultUserOutputFields
        });
        accounts._setAuthenticationCookie(res, {
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
    this.express.app.post("/api/_accounts/verify-email", async (req, res) => {
      try {
        await accounts.verifyEmail({
          token: req?.query?.token
        });
        res.redirect("/");
      } catch (exception) {
        console.log(exception);
        return res.status(500).send(JSON.stringify({
          errors: [formatAPIError(exception, "server")]
        }));
      }
    });
  }
  initUploaders(uploaders = {}) {
    const { app } = this.express;
    Object.entries(uploaders).forEach(([uploaderName, uploaderOptions]) => {
      const errors = validateUploaderOptions(uploaderOptions);
      if (errors?.length > 0) {
        log(errors, {
          level: "danger",
          docs: "https://github.com/cheatcode/joystick#uploaders"
        });
        return;
      }
      if (errors?.length === 0) {
        const formattedUploaderName = getAPIURLComponent(uploaderName);
        const upload = multer();
        const multerMiddleware = upload.array("files", 12);
        app.post(`/api/_uploaders/${formattedUploaderName}`, (req, res, next) => {
          let progress = 0;
          const fileSize = parseInt(req.headers["content-length"], 10);
          const providers = uploaderOptions?.providers?.includes("local") ? uploaderOptions?.providers.length : uploaderOptions?.providers?.length + 1;
          const totalFileSizeAllProviders = fileSize * providers;
          req.on("data", (chunk) => {
            progress += chunk.length;
            const percentage = Math.round(progress / totalFileSizeAllProviders * 100);
            emitWebsocketEvent(`uploaders_${req?.headers["x-joystick-upload-id"]}`, "progress", { provider: "uploadToServer", progress: percentage });
          });
          next();
        }, multerMiddleware, async (req, res) => {
          const input = req?.headers["x-joystick-upload-input"] ? JSON.parse(req?.headers["x-joystick-upload-input"]) : {};
          validateUploads({
            files: req?.files,
            input,
            uploaderName,
            uploaderOptions
          }).then(async (validatedUploads = []) => {
            if (typeof uploaderOptions?.onBeforeUpload === "function") {
              await uploaderOptions?.onBeforeUpload({
                input,
                req,
                uploads: validatedUploads
              });
            }
            const fileSize = parseInt(req.headers["content-length"], 10);
            const providers = uploaderOptions?.providers?.includes("local") ? uploaderOptions?.providers.length : uploaderOptions?.providers?.length + 1;
            const totalFileSizeAllProviders = fileSize * providers;
            const uploads = await runUploader({
              alreadyUploaded: fileSize,
              totalFileSizeAllProviders,
              uploads: validatedUploads,
              input,
              req
            });
            if (typeof uploaderOptions?.onAfterUpload === "function") {
              await uploaderOptions?.onAfterUpload({
                input,
                req,
                uploads
              });
            }
            res.status(200).send(JSON.stringify({
              status: 200,
              uploads
            }));
          }).catch((errors2) => {
            if (typeof errors2 === "string") {
              return res.status(403).send(JSON.stringify({
                errors: [formatAPIError(new Error(errors2))]
              }));
            }
            if (errors2 instanceof Error) {
              return res.status(403).send(JSON.stringify({
                errors: [formatAPIError(errors2)]
              }));
            }
            return res.status(403).send(JSON.stringify({
              errors: (errors2 || []).map((error) => {
                return formatAPIError(new Error(error?.message, "validation"));
              })
            }));
          });
        });
      }
    });
  }
  initFixtures(fixtures = null) {
    if (fixtures && typeof fixtures === "function") {
      fixtures();
    }
  }
  initQueues(queues = null) {
    if (queues && typeof queues === "object" && !Array.isArray(queues)) {
      const queueDefinitions = Object.entries(queues);
      for (let i = 0; i < queueDefinitions.length; i += 1) {
        const [queueName, queueOptions] = queueDefinitions[i];
        process.queues = {
          ...process.queues || {},
          [queueName]: new Queue(queueName, queueOptions)
        };
      }
    }
  }
  initCronJobs(cronJobs = null) {
    if (cronJobs && typeof cronJobs === "object" && !Array.isArray(cronJobs)) {
      const cronJobDefinitions = Object.entries(cronJobs);
      for (let i = 0; i < cronJobDefinitions.length; i += 1) {
        const [cronJobName, cronJobOptions] = cronJobDefinitions[i];
        if (cronJobOptions?.schedule && cronJobOptions?.run && typeof cronJobOptions?.run === "function") {
          process.cron = {
            ...process.queues || {},
            [cronJobName]: cron.schedule(cronJobOptions?.schedule, () => {
              if (cronJobOptions?.logAtRunTime && typeof cronJobOptions?.logAtRunTime === "string") {
                console.log(cronJobOptions.logAtRunTime);
              }
              cronJobOptions.run();
            })
          };
        }
      }
    }
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
