import { createClient } from "redis";
import chalk from "chalk";

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const connect_redis = async (database_settings = {}, database_port = 2610) => {
  const connection = database_settings?.connection || {
    host: "127.0.0.1",
    port: database_port,
    database: 0,
  };

  const connection_options = {
    socket: {
      host: connection?.host || "127.0.0.1",
      port: connection?.port || database_port,
    },
    database: connection?.database || 0,
    ...(database_settings?.options || {})
  };

  if (database_settings?.password) {
    connection_options.password = database_settings.password;
  }

  if (database_settings?.username) {
    connection_options.username = database_settings.username;
  }

  const max_retries = 30;
  const retry_delay = 1000;

  for (let attempt = 1; attempt <= max_retries; attempt++) {
    try {
      const client = createClient(connection_options);

      client.on('error', (error) => {
        if (attempt === max_retries) {
          console.warn(
            chalk.yellowBright(
              `\nRedis connection error: ${chalk.redBright(error?.message)}`
            )
          );
        }
      });

      await client.connect();
      return Promise.resolve(client);
    } catch (exception) {
      if (attempt === max_retries) {
        console.warn(
          chalk.yellowBright(
            `\nFailed to connect to Redis after ${max_retries} attempts. Please double-check connection settings and try again.\n\nError from Redis:\n\n${chalk.redBright(exception?.message)}`
          ),
        );
        throw exception;
      }

      if (attempt === 1) {
        console.log(chalk.yellowBright(`\nWaiting for Redis to be available on ${connection_options.socket.host}:${connection_options.socket.port}...`));
      }

      await wait(retry_delay);
    }
  }
};

export default connect_redis;
