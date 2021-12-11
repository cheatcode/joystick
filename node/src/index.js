import app from "./app/index.js";
import api from "./api/index.js";
import nodeUrlPolyfills from "./lib/nodeUrlPolyfills.js";
import generateId from "./lib/generateId.js";
import loadSettings from "./settings/load";
import sendEmail from "./email/send";


export const get = api.get;
export const set = api.set;
export const email = {
  send: sendEmail,
};
export const __filename = nodeUrlPolyfills.__filename;
export const __dirname = nodeUrlPolyfills.__dirname;

const settings = loadSettings();

global.joystick = {
  id: generateId,
  settings,
};

export default {
  app,
  settings,
};
