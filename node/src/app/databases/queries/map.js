import mongodb_accounts_queries from './mongodb/accounts.js';
import mongodb_queues_queries from './mongodb/queues.js';
import mongodb_sessions_queries from './mongodb/sessions.js';
import postgresql_accounts_queries from './postgresql/accounts.js';
import postgresql_queues_queries from './postgresql/queues.js';
import postgresql_sessions_queries from './postgresql/sessions.js';

const map = {
  mongodb: {
    accounts: mongodb_accounts_queries,
    queues: mongodb_queues_queries,
    sessions: mongodb_sessions_queries,
  },
  postgresql: {
    accounts: postgresql_accounts_queries,
    queues: postgresql_queues_queries,
    sessions: postgresql_sessions_queries,
  },
};

export default map;
