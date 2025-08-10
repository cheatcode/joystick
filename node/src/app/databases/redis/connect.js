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

    console.log(Object.keys(client));

    return {
      client,
      // Queue-specific operations (List commands)
      lpush: (...args) => client.lPush(...args),
      rpop: (...args) => client.rPop(...args),
      brpop: (...args) => client.brPop(...args),
      llen: (...args) => client.lLen(...args),
      lrange: (...args) => client.lRange(...args),
      lrem: (...args) => client.lRem(...args),
      
      // Hash operations for job data
      hset: (...args) => client.hSet(...args),
      hget: (...args) => client.hGet(...args),
      hgetall: (...args) => client.hGetAll(...args),
      hdel: (...args) => client.hDel(...args),
      hexists: (...args) => client.hExists(...args),
      
      // Set operations for job tracking
      sadd: (...args) => client.sAdd(...args),
      srem: (...args) => client.sRem(...args),
      smembers: (...args) => client.sMembers(...args),
      sismember: (...args) => client.sIsMember(...args),
      
      // Sorted set operations for scheduled jobs
      zadd: (...args) => client.zAdd(...args),
      zrem: (...args) => client.zRem(...args),
      zrange: (...args) => client.zRange(...args),
      zrangebyscore: (...args) => client.zRangeByScore(...args),
      zremrangebyscore: (...args) => client.zRemRangeByScore(...args),
      
      // Key operations
      set: (...args) => client.set(...args),
      get: (...args) => client.get(...args),
      del: (...args) => client.del(...args),
      exists: (...args) => client.exists(...args),
      expire: (...args) => client.expire(...args),
      
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
