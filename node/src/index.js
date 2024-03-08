import fs from 'fs';
import _accounts from './app/accounts/index.js';
import _action from "./action/index.js";
import _escape_html from './lib/escape_html.js';
import _fixture from './app/fixture/index.js';
import _sql from './app/databases/sql.js';
import _validate_input from './app/api/validate_input.js';
import _websockets from './app/websockets/index.js';
import app from './app/index.js';
import generate_id from './lib/generate_id.js';
import get_origin from './lib/get_origin.js';
import load_settings from './app/settings/load.js';
import node_path_polyfills from './lib/node_path_polyfills.js';
import path_exists from './lib/path_exists.js';
import send_email from './app/email/send.js';

const { readFile } = fs.promises;

// NOTE: Ensure backwards compatibility for existing apps by offering
// original camelCase versions of methods.
export const accounts = {
	..._accounts,
  deleteUser: _accounts.delete_user,
  recoverPassword: _accounts.recover_password,
  resetPassword: _accounts.reset_password,
  sendEmailVerification: _accounts.send_email_verification,
  setPassword: _accounts.set_password,
  verifyEmail: _accounts.verify_email,
};

export const action = _action;

export const __dirname = node_path_polyfills.__dirname;

export const email = {
  send: send_email,
};

export const escape_html = _escape_html;

export const __filename = node_path_polyfills.__filename;

export const fixture = _fixture;

export const origin = get_origin();

export const push = {
  continent: (await path_exists('/root/push/continent.txt')) ? (await readFile('/root/push/continent.txt', 'utf-8'))?.replace('\n', '') : null,
  instance_token: (await path_exists('/root/push/instance_token.txt')) ? (await readFile('/root/push/instance_token.txt', 'utf-8'))?.replace('\n', '') : null,
  current_version: (await path_exists('/root/push/versions/current')) ? (await readFile('/root/push/versions/current', 'utf-8'))?.replace('\n', '') : null,
};

export const settings = load_settings();

export const sql = _sql;

export const validate_input = _validate_input;

export const websockets = _websockets;

const joystick = {
	app,
	accounts,
  action,
  email,
  emitters: {},
  escape_html,
  fixture,
  id: generate_id,
  origin,
  push,
  settings,
  sql,
  validate_input,
  websockets,
  ...node_path_polyfills,
};

global.joystick = joystick;

export default joystick;
