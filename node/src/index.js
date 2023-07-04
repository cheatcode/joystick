import sanitizeHTML from "sanitize-html";

import _accounts from "./app/accounts";
import _action from "./action/index.js";
import _websockets from "./websockets";
import api from "./api/index.js";
import app from "./app/index.js";
import generateId from "./lib/generateId.js";
import getOrigin from "./api/getOrigin";
import loadSettings from "./settings/load";
import logs from "./logs/index.js";
import nodeUrlPolyfills from "./lib/nodeUrlPolyfills.js";
import sendEmail from "./email/send";

if (process.env.NODE_ENV !== "development" && process.env.IS_PUSH_DEPLOYED) {
  logs();
}

export const accounts = _accounts;
export const action = _action;
export const get = api.get;
export const set = api.set;
export const email = {
  send: sendEmail,
};
export const websockets = _websockets;
export const sanitize = {
  defaults: {
    allowedTags: sanitizeHTML.defaults.allowedTags,
  },
};

export const __filename = nodeUrlPolyfills.__filename;
export const __dirname = nodeUrlPolyfills.__dirname;
export const id = generateId;
export const origin = getOrigin();

const settings = loadSettings();

global.joystick = {
  id: generateId,
  emitters: {},
  settings,
};

export default {
  __dirname,
  __filename,
  accounts,
  action,
  app,
  email,
  get,
  id,
  origin,
  sanitize,
  set,
  settings,
  websockets,
};
