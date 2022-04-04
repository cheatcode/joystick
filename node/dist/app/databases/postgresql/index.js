import postgresql from "pg";
import chalk from "chalk";
const { Pool } = postgresql;
var postgresql_default = async (connectionFromSettings = null, driverOptions = {}) => {
  const connection = connectionFromSettings || {
    hosts: [
      { hostname: "127.0.0.1", port: parseInt(process.env.PORT, 10) + 10 }
    ],
    database: "app"
  };
  try {
    const host = connection.hosts && connection.hosts[0];
    const pool = new Pool({
      user: connection?.username || "",
      database: connection?.database,
      password: connection?.password || "",
      host: host?.hostname,
      port: host?.port,
      ...driverOptions || {}
    });
    return {
      pool,
      query: (...args) => {
        return pool.connect().then((client) => {
          return client.query(...args).then((res) => {
            client.release();
            return res.rows;
          });
        });
      }
    };
  } catch (exception) {
    console.warn(chalk.yellowBright(`
Failed to connect to PostgreSQL. Please double-check connection settings and try again.

Error from PostgreSQL:

${chalk.redBright(exception?.message)}`));
  }
};
export {
  postgresql_default as default
};
