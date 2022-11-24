import postgresql from "pg";
import chalk from "chalk";
import os from "os";
const { Pool } = postgresql;
var postgresql_default = async (settings = {}, databasePortBaseIndex = 0) => {
  const connection = settings?.connection || {
    hosts: [
      { hostname: "127.0.0.1", port: parseInt(process.env.PORT, 10) + 10 + databasePortBaseIndex }
    ],
    database: "app",
    username: (os.userInfo() || {}).username || "",
    password: ""
  };
  try {
    const host = connection.hosts && connection.hosts[0];
    const pool = new Pool({
      user: connection?.username || "",
      database: connection?.database,
      password: connection?.password || "",
      host: host?.hostname,
      port: host?.port,
      ...settings?.options || {}
    });
    return {
      pool,
      query: (...args) => {
        return pool.query(...args).then((response) => {
          return response?.rows || [];
        }).catch((error) => {
          throw error;
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
