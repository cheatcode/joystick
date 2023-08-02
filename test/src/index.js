import api from './helpers/api/index.js';
import component from './helpers/component/index.js';
import databases from './helpers/databases/index.js';
import email from './helpers/email/index.js';
import queues from './helpers/queues/index.js';
import load from './helpers/load/index.js';
import routes from './helpers/routes/index.js';
import uploaders from './helpers/uploaders/index.js';
import websockets from './helpers/websockets/index.js';
    
export default {
  api,
  component,
  databases,
  email,
  load,
  queues,
  routes,
  uploaders,
  websockets,
};


const functionToTest = await test.load('lib/someFunction.js');
