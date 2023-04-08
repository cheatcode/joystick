import mongodbAccountsQueries from './mongodb/queries/accounts';
import mongodbQueuesQueries from './mongodb/queries/queues';
import postgresqlAccountsQueries from './postgresql/queries/accounts';
import postgresqlQueuesQueries from './postgresql/queries/queues';

export default {
  mongodb: {
    accounts: mongodbAccountsQueries,
    queues: mongodbQueuesQueries,
  },
  postgresql: {
    accounts: postgresqlAccountsQueries,
    queues: postgresqlQueuesQueries,
  },
};
