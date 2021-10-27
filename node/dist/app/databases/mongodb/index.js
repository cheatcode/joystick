import { MongoClient } from "mongodb";
import chalk from "chalk";
import mongoUri from "mongo-uri-tool";
import buildConnectionString from "./buildConnectionString";
var mongodb_default = async (connectionFromSettings = null) => {
  const connection = connectionFromSettings || {
    hosts: [
      { hostname: "127.0.0.1", port: parseInt(process.env.PORT, 10) + 1 }
    ],
    database: "joystick"
  };
  const connectionString = buildConnectionString(connection);
  const parsedURI = mongoUri.parseUri(connectionString);
  try {
    const client = await MongoClient.connect(connectionString, {
      connectTimeoutMS: 3e3,
      socketTimeoutMS: 3e3,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: false
    });
    const db = client.db(parsedURI.db);
    return {
      client,
      db
    };
  } catch (exception) {
    console.warn(chalk.yellowBright(`
Failed to connect to MongoDB. Please double-check connection settings and try again.`));
  }
};
export {
  mongodb_default as default
};
