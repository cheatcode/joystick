import { MongoClient } from "mongodb";
import chalk from "chalk";
import buildConnectionString from "./buildConnectionString.js";

export default async (connection) => {
  const connectionString = buildConnectionString(connection);

  try {
    const connection = await MongoClient.connect(connectionString, {
      connectTimeoutMS: 3000,
      socketTimeoutMS: 3000,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: false,
    });

    connection.close();

    return true;
  } catch (exception) {
    console.warn(
      chalk.yellowBright(
        `\nFailed to connect to MongoDB. Please double-check connection settings and try again.`
      )
    );
    process.exit(1);
  }
};
