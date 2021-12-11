import app from "./app/index.js";
import api from "./api/index.js";
import nodeUrlPolyfills from "./lib/nodeUrlPolyfills.js";
import generateId from "./lib/generateId.js";
import loadSettings from "./settings/load";
import sendEmail from "./email/send";
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
  src_default as default,
  email,
  get,
  set
};
