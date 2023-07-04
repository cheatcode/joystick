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
const accounts = _accounts;
const action = _action;
const get = api.get;
const set = api.set;
const email = {
  send: sendEmail
};
const websockets = _websockets;
const sanitize = {
  defaults: {
    allowedTags: sanitizeHTML.defaults.allowedTags
  }
};
const __filename = nodeUrlPolyfills.__filename;
const __dirname = nodeUrlPolyfills.__dirname;
const id = generateId;
const origin = getOrigin();
const settings = loadSettings();
global.joystick = {
  id: generateId,
  emitters: {},
  settings
};
var src_default = {
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
  websockets
};
export {
  __dirname,
  __filename,
  accounts,
  action,
  src_default as default,
  email,
  get,
  id,
  origin,
  sanitize,
  set,
  websockets
};
