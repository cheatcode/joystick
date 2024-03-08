import fs from 'fs';
import postgresql from "pg";
import color_log from "../../../color_log.js";

const { Client } = postgresql;
const { readFile } = fs.promises;

const test_query = (client = {}) => {
  return new Promise((resolve, reject) => {
    client.query('SELECT NOW()', (error) => {
      if (error) {
        reject();
      } else {
        resolve();
      }

      client.end();
    });
  });
};

const check_connection = async (connection = {}, options = {}) => {
  try {
    const host = connection?.hosts && connection?.hosts[0];
    const connection_config = {
      user: connection?.username,
      host: host?.hostname,
      database: connection?.database,
      password: connection?.password,
      port: host?.port,
    };

    if (options?.ssl?.ca) {
      connection_config.ssl = {
        ca: await readFile(options?.ssl?.ca)
      };
    }

    const client = new Client(connection_config);

    client.connect();
    await test_query(client);

    return true;
  } catch (exception) {
    console.warn(exception);
  	color_log(
  		`\n✖ Failed to connect to PostgreSQL. Please double-check connection settings and try again.`,
  		'yellow'
  	);

    process.exit(1);
  }
};

export default check_connection;
