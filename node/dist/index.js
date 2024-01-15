import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import sanitizeHTML from "sanitize-html";
import _accounts from "./app/accounts";
import _action from "./action/index.js";
import _fixture from "./fixture/index.js";
import _test from "./test/index.js";
import _websockets from "./websockets";
import api from "./api/index.js";
import app from "./app/index.js";
import generateId from "./lib/generateId.js";
import _generate_sql_from_object from "./app/databases/generate_sql_from_object";
import getOrigin from "./api/getOrigin";
import loadSettings from "./settings/load";
import pushLogs from "./push/logs/index.js";
import nodeUrlPolyfills from "./lib/nodeUrlPolyfills.js";
import sendEmail from "./email/send";
const { readFile } = fs.promises;
if (process.env.NODE_ENV !== "development" && process.env.IS_PUSH_DEPLOYED) {
  await pushLogs();
}
const generate_sql_from_object = _generate_sql_from_object;
const accounts = _accounts;
const action = _action;
const fixture = _fixture;
const get = api.get;
const set = api.set;
const test = _test;
const email = {
  send: sendEmail
};
const websockets = _websockets;
const sanitize = {
  defaults: {
    allowedTags: sanitizeHTML.defaults.allowedTags
  }
};
const currentFilePath = fileURLToPath(import.meta.url);
const __package = dirname(currentFilePath);
const __filename = nodeUrlPolyfills.__filename;
const __dirname = nodeUrlPolyfills.__dirname;
const id = generateId;
const origin = getOrigin();
const settings = loadSettings();
const push = {
  continent: fs.existsSync("/root/push/continent.txt") ? (await readFile("/root/push/continent.txt", "utf-8"))?.replace("\n", "") : null,
  instance_token: fs.existsSync("/root/push/instance_token.txt") ? (await readFile("/root/push/instance_token.txt", "utf-8"))?.replace("\n", "") : null,
  current_version: fs.existsSync("/root/push/versions/current") ? (await readFile("/root/push/versions/current", "utf-8"))?.replace("\n", "") : null
};
global.joystick = {
  id: generateId,
  emitters: {},
  settings,
  __package,
  __dirname,
  __filename
};
var src_default = {
  __dirname,
  __filename,
  accounts,
  action,
  app,
  email,
  fixture,
  generate_sql_from_object,
  get,
  id,
  origin,
  push,
  sanitize,
  set,
  settings,
  websockets
};
export {
  __dirname,
  __filename,
  __package,
  accounts,
  action,
  src_default as default,
  email,
  fixture,
  generate_sql_from_object,
  get,
  id,
  origin,
  push,
  sanitize,
  set,
  test,
  websockets
};
