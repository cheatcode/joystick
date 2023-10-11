import mongodbAccountsQueries from "./mongodb/queries/accounts";
import mongodbQueuesQueries from "./mongodb/queries/queues";
import mongodbSessionsQueries from "./mongodb/queries/sessions";
import postgresqlAccountsQueries from "./postgresql/queries/accounts";
import postgresqlQueuesQueries from "./postgresql/queries/queues";
import postgresqlSessionsQueries from "./postgresql/queries/sessions";
var queryMap_default = {
  mongodb: {
    accounts: mongodbAccountsQueries,
    queues: mongodbQueuesQueries,
    sessions: mongodbSessionsQueries
  },
  postgresql: {
    accounts: postgresqlAccountsQueries,
    queues: postgresqlQueuesQueries,
    sessions: postgresqlSessionsQueries
  }
};
export {
  queryMap_default as default
};
