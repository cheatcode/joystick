import { MongoClient } from "mongodb";
import chalk from "chalk";
import mongoUri from "mongo-uri-tool";
import fs from 'fs';
import buildConnectionString from "./buildConnectionString.js";

export default async (settings = {}, databasePort = 2610) => {
  const connection = settings?.connection || {
    hosts: [
      // NOTE: By default, expect databases start from 2610 (assuming a PORT of 2600).
      { hostname: "127.0.0.1", port: databasePort },
    ],
    database: "app",
    replicaSet: `joystick_${databasePort}`,
  };

  const connectionString = buildConnectionString(connection);
  const parsedURI = mongoUri.parseUri(connectionString);

  try {
    const connectionOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: !['development', 'test'].includes(process.env.NODE_ENV),
      ...(settings?.options || {})
    };

    if (settings?.options?.ca) {
      connectionOptions.ca = fs.readFileSync(settings?.options?.ca);
    }

    const client = await MongoClient.connect(connectionString, connectionOptions);
    const db = client.db(parsedURI.db);

    return db;
  } catch (exception) {
    console.warn(
      chalk.yellowBright(
        `\nFailed to connect to MongoDB. Please double-check connection settings and try again.\n\nError from MongoDB:\n\n${chalk.redBright(exception?.message)}`
      ),
    );
  }
};
