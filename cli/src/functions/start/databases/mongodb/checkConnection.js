import { MongoClient } from "mongodb";
import chalk from "chalk";
import fs from 'fs';
import buildConnectionString from "./buildConnectionString.js";

export default async (connection = {}, options = {}) => {
  const connectionString = buildConnectionString(connection);
  console.log({
    connectionString
  })

  try {
    const connectionOptions = {
      connectTimeoutMS: 3000,
      socketTimeoutMS: 3000,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: false,
      ...(options || {}),
    };

    if (options?.ca) {
      connectionOptions.ca = fs.readFileSync(options?.ca);
    }

    const connection = await MongoClient.connect(connectionString, connectionOptions);

    connection.close();

    return true;
  } catch (exception) {
    console.warn(exception);
    console.warn(
      chalk.yellowBright(
        `\nFailed to connect to MongoDB. Please double-check connection settings and try again.`
      )
    );
    process.exit(1);
  }
};
