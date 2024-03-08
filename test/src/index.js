import _test from './test.js';
import accounts_signup from "./helpers/accounts/signup.js";
import accounts_delete from './helpers/accounts/delete.js';
import api from './helpers/api/index.js';
import render from './helpers/render/index.js';
import databases from './helpers/databases/index.js';
import queues from './helpers/queues/index.js';
import load from './helpers/load/index.js';
import routes from './helpers/routes/index.js';
import uploaders from './helpers/uploaders/index.js';
import utils from "./helpers/utils/index.js";
import websockets from './helpers/websockets/index.js';

const test = {
  accounts: {
    signup: accounts_signup,
    delete: accounts_delete,
  },
  after: _test.after,
  after_each: _test.after_each,
  afterEach: _test.after_each,
  api,
  before: _test.before,
  before_each: _test.before_each,
  beforeEach: _test.before_each,
  render,
  databases,
  load,
  queues,
  routes,
  that: _test.that,
  uploaders,
  utils,
  websockets,
};

export default test;
