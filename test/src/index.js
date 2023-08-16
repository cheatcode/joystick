import test from './test.js';
import api from './helpers/api/index.js';
import render from './helpers/render/index.js';
import databases from './helpers/databases/index.js';
import email from './helpers/email/index.js';
import queues from './helpers/queues/index.js';
import load from './helpers/load/index.js';
import routes from './helpers/routes/index.js';
import uploaders from './helpers/uploaders/index.js';
import websockets from './helpers/websockets/index.js';

export default {
  accounts: {
    login: test.loginUser,
    signup: test.signupUser,
    delete: test.deleteUser,
  },
  after: test.after,
  afterEach: test.afterEach,
  api,
  before: test.before,
  beforeEach: test.beforeEach,
  render,
  databases,
  email,
  load,
  queues,
  routes,
  that: test.that,
  uploaders,
  websockets,
};
