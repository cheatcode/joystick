import fs from 'fs';
import { fileURLToPath } from "url";
import { dirname } from "path";
import sanitizeHTML from "sanitize-html";
import _accounts from "./app/accounts";
import _action from "./action/index.js";
import _fixture from './fixture/index.js';
import _test from './test/index.js';
import _websockets from "./websockets";
import api from "./api/index.js";
import app from "./app/index.js";
import generateId from "./lib/generateId.js";
import _generate_sql_from_object from './app/databases/generate_sql_from_object';
import getOrigin from "./api/getOrigin";
import loadSettings from "./settings/load";
import pushLogs from "./push/logs/index.js";
import nodeUrlPolyfills from "./lib/nodeUrlPolyfills.js";
import sendEmail from "./email/send";

const { readFile } = fs.promises;

if (process.env.NODE_ENV !== "development" && process.env.IS_PUSH_DEPLOYED) {
  await pushLogs();
}

export const generate_sql_from_object = _generate_sql_from_object;

export const accounts = _accounts;
export const action = _action;

export const fixture = _fixture;

export const get = api.get;
export const set = api.set;
export const test = _test;
export const email = {
  send: sendEmail,
};
export const websockets = _websockets;
export const sanitize = {
  defaults: {
    allowedTags: sanitizeHTML.defaults.allowedTags,
  },
};

// NOTE: __package is a Joystick-only global variable which gives us access to
// the path of the @joystick.js/node[-canary] package that contains this file.
const currentFilePath = fileURLToPath(import.meta.url);
export const __package = dirname(currentFilePath);
export const __filename = nodeUrlPolyfills.__filename;
export const __dirname = nodeUrlPolyfills.__dirname;
export const id = generateId;
export const origin = getOrigin();

const settings = loadSettings();

export const push = {
  continent: fs.existsSync('/root/push/continent.txt') ? (await readFile('/root/push/continent.txt', 'utf-8'))?.replace('\n', '') : null,
  instance_token: fs.existsSync('/root/push/instance_token.txt') ? (await readFile('/root/push/instance_token.txt', 'utf-8'))?.replace('\n', '') : null,
  current_version: fs.existsSync('/root/push/versions/current') ? (await readFile('/root/push/versions/current', 'utf-8'))?.replace('\n', '') : null,
};

global.joystick = {
  id: generateId,
  emitters: {},
  settings,
  __package,
  __dirname,
  __filename,
};

export default {
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
  websockets,
};
