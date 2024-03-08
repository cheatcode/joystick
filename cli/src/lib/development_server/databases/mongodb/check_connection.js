import { MongoClient } from "mongodb";
import fs from 'fs';
import build_connection_string from "./build_connection_string.js";
import color_log from '../../../color_log.js';

const { readFile } = fs.promises;

const check_connection = async (connection = {}, mongodb_options = {}) => {
  const connection_string = build_connection_string(connection);
  
  try {
    const connectionOptions = {
      connectTimeoutMS: 3000,
      socketTimeoutMS: 3000,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: false,
      ...(mongodb_options || {}),
    };

    if (mongodb_options?.ca) {
      connectionOptions.ca = await readFile(mongodb_options?.ca);
    }

    const connection = await MongoClient.connect(connection_string, connectionOptions);
    connection.close();

    return true;
  } catch (exception) {
    console.warn(exception);

    color_log(
    	`\n✖ Failed to connect to MongoDB. Please double-check connection settings and try again.`,
    	'yellow'
    );

    process.exit(1);
  }
};

export default check_connection;
