import mongodbAccountsQueries from "./mongodb/queries/accounts";
import mongodbQueuesQueries from "./mongodb/queries/queues";
import postgresqlAccountsQueries from "./postgresql/queries/accounts";
import postgresqlQueuesQueries from "./postgresql/queries/queues";
var queryMap_default = {
  mongodb: {
    accounts: mongodbAccountsQueries,
    queues: mongodbQueuesQueries
  },
  postgresql: {
    accounts: postgresqlAccountsQueries,
    queues: postgresqlQueuesQueries
  }
};
export {
  queryMap_default as default
};
