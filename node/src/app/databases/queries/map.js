import mongodb_accounts_queries from './mongodb/accounts.js';
import mongodb_queues_queries from './mongodb/queues.js';
import postgresql_accounts_queries from './postgresql/accounts.js';
import postgresql_queues_queries from './postgresql/queues.js';
import redis_queues_queries from './redis/queues.js';

const map = {
  mongodb: {
    accounts: mongodb_accounts_queries,
    queues: mongodb_queues_queries,
  },
  postgresql: {
    accounts: postgresql_accounts_queries,
    queues: postgresql_queues_queries,
  },
  redis: {
    queues: redis_queues_queries,
  },
};

export default map;
