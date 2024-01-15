import express from "express";
import compression from "compression";
import cookieParser from "cookie-parser";
import favicon from "serve-favicon";
import fs from "fs";
import { __package } from "../../index.js";
import insecure from "./insecure.js";
import requestMethods from "./requestMethods.js";
import bodyParser from "./bodyParser.js";
import cors from "./cors.js";
import render from "./render.js";
import generateErrorPage from "../../lib/generateErrorPage.js";
import hasLoginTokenExpired from "../accounts/hasLoginTokenExpired.js";
import runUserQuery from "../accounts/runUserQuery.js";
import replaceBackslashesWithForwardSlashes from "../../lib/replaceBackslashesWithForwardSlashes.js";
import replaceFileProtocol from "../../lib/replaceFileProtocol.js";
import getBuildPath from "../../lib/getBuildPath.js";
import session from "./session.js";
import csp from "./csp.js";
const { readFile } = fs.promises;
const cwd = replaceFileProtocol(replaceBackslashesWithForwardSlashes(process.cwd()));
const faviconPath = "public/favicon.ico";
var middleware_default = ({
  app,
  port,
  middlewareConfig,
  appInstance,
  cspConfig
}) => {
  if (process.env.NODE_ENV !== "development") {
    app.use(insecure);
  }
  const buildPath = getBuildPath();
  app.use((_req, res, next) => {
    if (process.BUILD_ERROR) {
      const error = process.BUILD_ERROR.paths && process.BUILD_ERROR.paths[0];
      return res.send(generateErrorPage({
        path: error.path,
        stack: error.error.stack,
        frame: error.error.snippet
      }));
    }
    next();
  });
  app.use(requestMethods);
  app.enable("trust proxy");
  if (cspConfig) {
    app.use((req, res, next) => csp(req, res, next, cspConfig));
  }
  app.use(compression());
  app.use("/css", express.static("css", { eTag: false, maxAge: "0" }));
  app.use(express.static("public", { eTag: false, maxAge: "0" }));
  app.use("/_joystick/heartbeat", (_req, res) => {
    res.status(200).send("<3");
  });
  app.use("/_joystick/utils/process.js", async (_req, res) => {
    res.set("Content-Type", "text/javascript");
    const processPolyfill = await readFile(`${__package}/app/utils/process.js`, "utf-8");
    res.send(processPolyfill.replace("${NODE_ENV}", process.env.NODE_ENV));
  });
  app.use("/_joystick/index.client.js", express.static(`${buildPath}index.client.js`, {
    eTag: false,
    maxAge: "0"
  }));
  app.use("/_joystick/index.css", express.static(`${buildPath}index.css`, { eTag: false, maxAge: "0" }));
  app.use("/_joystick/ui", express.static(`${buildPath}ui`, { eTag: false, maxAge: "0" }));
  app.use("/_joystick/hmr/client.js", async (_req, res) => {
    res.set("Content-Type", "text/javascript");
    const hmrClient = await readFile(`${__package}/app/middleware/hmr/client.js`, "utf-8");
    res.send(hmrClient.replace("${process.env.PORT}", parseInt(process.env.PORT, 10) + 1));
  });
  app.use(favicon(faviconPath));
  app.use(cookieParser());
  app.use(bodyParser(middlewareConfig?.bodyParser));
  app.use(cors(middlewareConfig?.cors, port));
  if (process.databases?._sessions) {
    app.use((req, res, next) => session(req, res, next));
  }
  app.use(async (req, res, next) => {
    const loginTokenHasExpired = await hasLoginTokenExpired(res, req?.cookies?.joystickLoginToken, req?.cookies?.joystickLoginTokenExpiresAt);
    req.context = {
      ...req?.context || {},
      user: !loginTokenHasExpired && await runUserQuery("userWithLoginToken", {
        token: req?.cookies?.joystickLoginToken
      }) || null
    };
    next();
  });
  app.use((req, res, next) => render(req, res, next, appInstance));
};
export {
  middleware_default as default
};
