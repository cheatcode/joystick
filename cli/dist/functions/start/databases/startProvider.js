import connectMongoDB from "./mongodb/connect.js";
import connectPostgreSQL from "./postgresql/connect.js";
var startProvider_default = async (database = {}, databasePort = 2610) => {
  switch (database.provider) {
    case "mongodb":
      process.loader.text("Starting MongoDB...");
      return connectMongoDB(database, databasePort);
    case "postgresql":
      process.loader.text("Starting PostgreSQL...");
      return connectPostgreSQL(database, databasePort);
  }
  return Promise.resolve();
};
export {
  startProvider_default as default
};
