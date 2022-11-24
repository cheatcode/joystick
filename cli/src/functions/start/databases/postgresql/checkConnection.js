import postgresql from "pg";
import chalk from "chalk";

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

export default async (connection) => {
  try {
    const host = connection?.hosts && connection?.hosts[0];
    const client = new Client({
      user: connection?.username,
      host: host?.hostname,
      database: connection?.database,
      password: connection?.password,
      port: host?.port,
    });

    client.connect();
    await testQuery(client);

    return true;
  } catch (exception) {
    console.warn(
      chalk.yellowBright(
        `\nFailed to connect to PostgreSQL. Please double-check connection settings and try again.`
      )
    );
    process.exit(1);
  }
};
