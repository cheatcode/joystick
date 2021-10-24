import app from "./app/index.js";
import api from "./api/index.js";
import generateId from "./lib/generateId.js";
import loadSettings from "./settings/load";
import sendEmail from "./email/send";

export const get = api.get;
export const set = api.set;
export const email = {
  send: sendEmail,
};

const settings = loadSettings();

global.joystick = {
  id: generateId,
  settings,
};

export default {
  app,
  settings,
};
