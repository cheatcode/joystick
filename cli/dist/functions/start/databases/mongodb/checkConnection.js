import { MongoClient } from "mongodb";
import chalk from "chalk";
import fs from "fs";
import buildConnectionString from "./buildConnectionString.js";
var checkConnection_default = async (connection = {}, options = {}) => {
  const connectionString = buildConnectionString(connection);
  try {
    const connectionOptions = {
      connectTimeoutMS: 3e3,
      socketTimeoutMS: 3e3,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: false,
      ...options || {}
    };
    if (options?.ca) {
      connectionOptions.ca = fs.readFileSync(options?.ca);
    }
    const connection2 = await MongoClient.connect(connectionString, connectionOptions);
    connection2.close();
    return true;
  } catch (exception) {
    console.warn(exception);
    console.warn(chalk.yellowBright(`
Failed to connect to MongoDB. Please double-check connection settings and try again.`));
    process.exit(1);
  }
};
export {
  checkConnection_default as default
};
