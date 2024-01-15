import postgresql from "pg";
import chalk from "chalk";
import fs from 'fs';

const { Client } = postgresql;

const testQuery = (client = {}) => {
  return new Promise((resolve, reject) => {
    client.query('SELECT NOW()', (error) => {
      if (error) {
        reject();
      } else {
        resolve();
      }

      client.end()
    });
  });
};

export default async (connection = {}, options = {}) => {
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
        ca: fs.readFileSync(options?.ssl?.ca)
      };
    }

    const client = new Client(connection_config);

    client.connect();
    await testQuery(client);

    return true;
  } catch (exception) {
    console.warn(
      chalk.yellowBright(
        `\nFailed to connect to PostgreSQL. Please double-check connection settings and try again.`
      )
    );
    console.warn(exception);

    process.exit(1);
  }
};
