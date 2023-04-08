import postgresql from 'pg';
import chalk from "chalk";
import os from 'os';

const { Pool } = postgresql;

export default async (settings = {}, databasePortBaseIndex = 0) => {
  const connection = settings?.connection || {
    hosts: [
      { hostname: "127.0.0.1", port: parseInt(process.env.PORT, 10) + 10 + databasePortBaseIndex },
    ],
    database: "app",
    // NOTE: PostgreSQL creates a default superuser based on the OS username.
    username: (os.userInfo() || {}).username || "",
    password: "",
  };

  try {
    const host = connection.hosts && connection.hosts[0];
    const pool = new Pool({
      user: connection?.username || '',
      database: connection?.database,
      password: connection?.password || '',
      host: host?.hostname,
      port: host?.port,
      ...(settings?.options || {})
    });
  
    return {
      pool,
      query: (...args) => {
        return pool.query(...args).then((response) => {
          return response?.rows || [];
        }).catch((error) => {
          console.log(chalk.redBright(`\nFailed SQL Statement:\n`));
          console.log(args[0]);
          console.log(`\n`);
          console.log(chalk.redBright(`\nFailed Values:\n`));
          console.log(args[1]);

          throw error;
        });
      }
    };
  } catch (exception) {
    console.warn(
      chalk.yellowBright(
        `\nFailed to connect to PostgreSQL. Please double-check connection settings and try again.\n\nError from PostgreSQL:\n\n${chalk.redBright(exception?.message)}`
      ),
    );
  }
};
