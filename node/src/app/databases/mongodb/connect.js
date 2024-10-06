import chalk from "chalk";
import fs from 'fs';
import { MongoClient } from "mongodb";
import mongo_uri from "mongo-uri-tool";
import build_connection_string from "./build_connection_string.js";

const connect_mongodb = async (database_settings = {}, database_port = 2610) => {
  try {
    const connection = database_settings?.connection || {
      hosts: [
        { hostname: "127.0.0.1", port: database_port },
      ],
      database: "app",
      replicaSet: `joystick_${database_port}`,
    };

    const connection_string = build_connection_string(connection);
    const parsed_uri = mongo_uri.parseUri(connection_string);

    const connection_options = {
      maxIdleTimeMS: 15000,
      ssl: !['development', 'test'].includes(process.env.NODE_ENV),
      ...(database_settings?.options || {})
    };

    if (database_settings?.options?.ca) {
      connection_options.ca = fs.readFileSync(database_settings?.options?.ca);
    }

    console.log({ connection_string, connection_options });

    const client = await MongoClient.connect(connection_string, connection_options);
    const db = client.db(parsed_uri.db);

    return Promise.resolve(db);
  } catch (exception) {
    console.warn(exception);
    console.warn(
      chalk.yellowBright(
        `\nFailed to connect to MongoDB. Please double-check connection settings and try again.\n\nError from MongoDB:\n\n${chalk.redBright(exception?.message)}`
      ),
    );
  }
};

export default connect_mongodb;
