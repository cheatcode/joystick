import app from "./app/index.js";
import api from "./api/index.js";
import generateId from "./lib/generateId.js";
import loadSettings from "./settings/load";
import sendEmail from "./email/send";
const get = api.get;
const set = api.set;
const email = {
  send: sendEmail
};
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
  src_default as default,
  email,
  get,
  set
};
