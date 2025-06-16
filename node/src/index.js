import _accounts from './app/accounts/index.js';
import _action from "./action/index.js";
import _cache from './cache/index.js';
import _escape_html from './lib/escape_html.js';
import _escape_markdown_string from './lib/escape_markdown_string.js';
import _fixture from './app/fixture/index.js';
import _sanitize_api_response from './app/api/sanitize_api_response.js';
import _set_cookie from './lib/set_cookie.js';
import _sql from './app/databases/sql.js';
import _unset_cookie from './lib/unset_cookie.js';
import _validate_input from './app/api/validate_input.js';
import _websockets from './app/websockets/index.js';
import app from './app/index.js';
import generate_id from './lib/generate_id.js';
import get_origin from './lib/get_origin.js';
import load_settings from './app/settings/load.js';
import node_path_polyfills from './lib/node_path_polyfills.js';
import send_email from './app/email/send.js';

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

export const cache = _cache;

export const __dirname = node_path_polyfills.__dirname;

export const email = {
  send: send_email,
};

export const escape_html = _escape_html;
export const escape_markdown_string = _escape_markdown_string;

export const __filename = node_path_polyfills.__filename;

export const fixture = _fixture;

export const origin = get_origin();

export const sanitize = _sanitize_api_response;

export const set_cookie = _set_cookie;

export const settings = load_settings();

export const sql = _sql;

export const unset_cookie = _unset_cookie;

export const validate_input = _validate_input;

export const websockets = _websockets;

const joystick = {
	app,
	accounts,
  action,
  cache,
  email,
  emitters: {},
  escape_html,
  escape_markdown_string,
  fixture,
  id: generate_id,
  origin,
  sanitize,
  set_cookie,
  settings,
  sql,
  unset_cookie,
  validate_input,
  websockets,
  ...node_path_polyfills,
};

global.joystick = joystick;

process.env.ROOT_URL = settings?.config?.ROOT_URL || process.env.ROOT_URL || `http://localhost:${process.env.PORT}`;

export default joystick;
