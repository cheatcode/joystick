import connectMongoDB from "./mongodb/connect.js";
import connectPostgreSQL from "./postgresql/connect.js";
var providerMap_default = {
  mongodb: {
    name: "MongoDB",
    connect: connectMongoDB
  },
  postgresql: {
    name: "PostgreSQL",
    connect: connectPostgreSQL
  }
};
export {
  providerMap_default as default
};
