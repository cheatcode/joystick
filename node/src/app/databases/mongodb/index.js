import { MongoClient } from "mongodb";
import chalk from "chalk";
import mongoUri from "mongo-uri-tool";
import fs from 'fs';
import buildConnectionString from "./buildConnectionString";

export default async (connectionFromSettings = null, driverOptions = {}) => {
  const connection = connectionFromSettings || {
    hosts: [
      { hostname: "127.0.0.1", port: parseInt(process.env.PORT, 10) + 10 },
    ],
    database: "app",
  };

  const connectionString = buildConnectionString(connection);
  const parsedURI = mongoUri.parseUri(connectionString);

  try {
    const connectionOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: process.env.NODE_ENV !== 'development',
      ...(driverOptions || {})
    };

    if (driverOptions?.ca) {
      connectionOptions.ca = fs.readFileSync(driverOptions?.ca);
    }

    const client = await MongoClient.connect(connectionString, connectionOptions);
    const db = client.db(parsedURI.db);

    return {
      client,
      db,
    };
  } catch (exception) {
    console.warn(
      chalk.yellowBright(
        `\nFailed to connect to MongoDB. Please double-check connection settings and try again.\n\nError from MongoDB:\n\n${chalk.redBright(exception?.message)}`
      ),
    );
  }
};
