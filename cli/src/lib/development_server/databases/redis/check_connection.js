import redis from 'redis';
import color_log from '../../../color_log.js';

const check_connection = async (connection = {}, options = {}) => {
  try {
    const host = connection?.hosts && connection?.hosts[0];
    const connection_config = {
      socket: {
        host: host?.hostname || '127.0.0.1',
        port: host?.port || 6379,
        connectTimeout: 3000,
      },
      database: connection?.database || 0,
    };

    if (connection?.username) {
      connection_config.username = connection.username;
    }

    if (connection?.password) {
      connection_config.password = connection.password;
    }

    const client = redis.createClient(connection_config);

    await client.connect();
    await client.ping();
    await client.disconnect();

    return true;
  } catch (exception) {
    console.warn(exception);
    color_log(
      `\n✖ Failed to connect to Redis. Please double-check connection settings and try again.`,
      'yellow'
    );

    process.exit(1);
  }
};

export default check_connection;
