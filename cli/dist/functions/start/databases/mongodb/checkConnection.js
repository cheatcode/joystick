import { MongoClient } from "mongodb";
import chalk from "chalk";
import buildConnectionString from "./buildConnectionString.js";
var checkConnection_default = async (connection) => {
  const connectionString = buildConnectionString(connection);
  try {
    const connection2 = await MongoClient.connect(connectionString, {
      connectTimeoutMS: 3e3,
      socketTimeoutMS: 3e3,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: false
    });
    connection2.close();
    return true;
  } catch (exception) {
    console.warn(chalk.yellowBright(`
Failed to connect to MongoDB. Please double-check connection settings and try again.`));
    process.exit(1);
  }
};
export {
  checkConnection_default as default
};
