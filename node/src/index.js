import _accounts from './app/accounts';
import api from "./api/index.js";
import getOrigin from './api/getOrigin';
import nodeUrlPolyfills from "./lib/nodeUrlPolyfills.js";
import sendEmail from "./email/send";
import loadSettings from "./settings/load";
import generateId from "./lib/generateId.js";
import app from "./app/index.js";
import logs from "./logs/index.js";

if (process.env.NODE_ENV !== 'development' && process.env.IS_JOYSTICK_DEPLOY) {
  logs();
}

export const accounts = _accounts;
export const get = api.get;
export const set = api.set;
export const email = {
  send: sendEmail,
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
  id: generateId,
  app,
  settings,
};
