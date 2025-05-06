import { MongoClient } from "mongodb";
import fs from 'fs';
import build_connection_string from "./build_connection_string.js";
import color_log from '../../../color_log.js';

const { readFile } = fs.promises;

const check_connection = async (connection = {}, mongodb_options = {}) => {
  const connection_string = build_connection_string(connection);
  
  try {
    const connection_options = {
      connectTimeoutMS: 3000,
      socketTimeoutMS: 3000,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      tls: false,
      ...(mongodb_options || {}),
    };

    if (mongodb_options?.tlsCAFile) {
      connection_options.tlsCAFile = fs.readFileSync(mongodb_options?.tlsCAFile);
    }

    if (mongodb_options?.tlsCertificateKeyFile) {
      connection_options.tlsCertificateKeyFile = fs.readFileSync(mongodb_options?.tlsCertificateKeyFile);
    }

    const connection = await MongoClient.connect(connection_string, connection_options);
    
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
