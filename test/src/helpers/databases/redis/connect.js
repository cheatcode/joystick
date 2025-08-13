import { createClient } from "redis";
import chalk from "chalk";

const connect_redis = async (database_settings = {}, database_port = 2610) => {
  try {
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

    const client = createClient(connection_options);

    client.on('error', (error) => {
      console.warn(
        chalk.yellowBright(
          `\nRedis connection error: ${chalk.redBright(error?.message)}`
        )
      );
    });

    await client.connect();

    return Promise.resolve(client);
  } catch (exception) {
    console.warn(
      chalk.yellowBright(
        `\nFailed to connect to Redis. Please double-check connection settings and try again.\n\nError from Redis:\n\n${chalk.redBright(exception?.message)}`
      ),
    );
  }
};

export default connect_redis;
