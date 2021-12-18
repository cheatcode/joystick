import _accounts from "./app/accounts";
import api from "./api/index.js";
import nodeUrlPolyfills from "./lib/nodeUrlPolyfills.js";
import sendEmail from "./email/send";
import loadSettings from "./settings/load";
import generateId from "./lib/generateId.js";
import app from "./app/index.js";
const accounts = _accounts;
const get = api.get;
const set = api.set;
const email = {
  send: sendEmail
};
const __filename = nodeUrlPolyfills.__filename;
const __dirname = nodeUrlPolyfills.__dirname;
const settings = loadSettings();
global.joystick = {
  id: generateId,
  settings
};
var src_default = {
  app,
  settings
};
export {
  __dirname,
  __filename,
  accounts,
  src_default as default,
  email,
  get,
  set
};
