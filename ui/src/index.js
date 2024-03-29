import _accounts from './accounts/index.js';
import _cache from './cache/index.js';
import _get_external from './external/get.js';
import _test from './test/index.js';
import _track_external from './external/track.js';
import _upload from "./upload/index.js";
import api from "./api/index.js";
import attach_joystick_to_window from './attach_joystick_to_window.js';
import component from './component/index.js';
import generate_id from './lib/generate_id.js';
import get_joystick_environment from './lib/get_joystick_environment.js';
import mount from './mount/index.js';

const joystick_environment = get_joystick_environment();

export const accounts = _accounts;
export const cache = _cache;
export const external = {
  get: _get_external,
  track: _track_external,
};
export const get = api.get;
export const global_state = _cache('app', {});
export const set = api.set;
export const test = _test;
export const upload = _upload;

const joystick = {
	_external: {},
	_internal: {
  	tree: [],
	},
	accounts,
	cache,
	component,
  env: {
    development: joystick_environment === 'development',
    staging: joystick_environment === 'staging',
    production: joystick_environment === 'production',
    test: joystick_environment === 'test',
  },
  external,
  get,
  global_state,
	id: generate_id,
  mount,
  set,
  test,
  upload,
};

attach_joystick_to_window(joystick);

export default joystick;

