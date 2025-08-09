import chalk from "chalk";
import { createClient } from "redis";

const connect_redis = async (database_settings = {}, database_port = 2610) => {
  try {
    const connection = database_settings?.connection || {
      hosts: [
        { hostname: "127.0.0.1", port: database_port },
      ],
      database: 0,
    };

    const host = connection.hosts && connection.hosts[0];
    const connection_config = {
      socket: {
        host: host?.hostname || "127.0.0.1",
        port: host?.port || database_port,
      },
      database: connection?.database || 0,
      ...(connection?.password && { password: connection.password }),
      ...(connection?.username && { username: connection.username }),
      ...(database_settings?.options || {})
    };

    if (database_settings?.options?.tls) {
      connection_config.socket.tls = true;
    }

    const client = createClient(connection_config);

    client.on('error', (error) => {
      console.warn(chalk.redBright(`Redis connection error: ${error.message}`));
    });

    client.on('connect', () => {
      // Silently handle Redis connection
    });

    await client.connect();

    return {
      client,
      // Queue-specific operations
      lpush: (...args) => client.LPUSH(...args),
      rpop: (...args) => client.RPOP(...args),
      brpop: (...args) => client.BRPOP(...args),
      llen: (...args) => client.LLEN(...args),
      lrange: (...args) => client.LRANGE(...args),
      lrem: (...args) => client.LREM(...args),
      
      // Hash operations for job data
      hset: (...args) => client.HSET(...args),
      hget: (...args) => client.HGET(...args),
      hgetall: (...args) => client.HGETALL(...args),
      hdel: (...args) => client.HDEL(...args),
      hexists: (...args) => client.HEXISTS(...args),
      
      // Set operations for job tracking
      sadd: (...args) => client.SADD(...args),
      srem: (...args) => client.SREM(...args),
      smembers: (...args) => client.SMEMBERS(...args),
      sismember: (...args) => client.SISMEMBER(...args),
      
      // Sorted set operations for scheduled jobs
      zadd: (...args) => client.ZADD(...args),
      zrem: (...args) => client.ZREM(...args),
      zrange: (...args) => client.ZRANGE(...args),
      zrangebyscore: (...args) => client.ZRANGEBYSCORE(...args),
      zremrangebyscore: (...args) => client.ZREMRANGEBYSCORE(...args),
      
      // Key operations
      set: (...args) => client.SET(...args),
      get: (...args) => client.GET(...args),
      del: (...args) => client.DEL(...args),
      exists: (...args) => client.EXISTS(...args),
      expire: (...args) => client.EXPIRE(...args),
      
      // Transaction support
      multi: () => client.multi(),
      
      // Raw client access for advanced operations
      _connection: client,
    };
  } catch (exception) {
    console.warn(exception);
    console.warn(
      chalk.yellowBright(
        `\nFailed to connect to Redis. Please double-check connection settings and try again.\n\nError from Redis:\n\n${chalk.redBright(exception?.message)}`
      ),
    );
  }
};

export default connect_redis;
