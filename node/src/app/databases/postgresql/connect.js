import chalk from "chalk";
import fs from 'fs';
import os from 'os';
import postgresql from 'pg';
import sql from '../sql.js';

const { Pool } = postgresql;

const connect_postgresql = async (database_settings = {}, database_port = 2610) => {
  const connection = database_settings?.connection || {
    hosts: [
      { hostname: "127.0.0.1", port: database_port },
    ],
    database: "app",
    // NOTE: PostgreSQL creates a default superuser based on the OS username. If using Linux,
    // we have to use the postgres user due to permissions.
    username: process.platform === 'linux' ? 'postgres' : ((os.userInfo() || {}).username || ""),
    password: "",
  };

  try {
    const host = connection.hosts && connection.hosts[0];
    const connection_config = {
      user: connection?.username || '',
      database: connection?.database,
      password: connection?.password || '',
      host: host?.hostname,
      port: host?.port,
      ...(database_settings?.options || {})
    };
    
    if (database_settings?.options?.ssl?.ca) {
      connection_config.ssl = {
        ca: fs.readFileSync(database_settings?.options?.ssl?.ca),
      };
    }

    const pool = new Pool(connection_config);
  
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
      },
      add_column: (options = {}) => {
        const column = sql.add_column(options);
        return pool.query(column.statement).then((response) => {
          return response?.rows || [];
        }).catch((error) => {
          console.log(chalk.redBright(`\nFailed SQL Statement:\n`));
          console.log(column.statement);

          throw error;
        });
      },
      create_table: (options = {}) => {
        const table = sql.create_table(options);
        return pool.query(table.statement).then((response) => {
          return response?.rows || [];
        }).catch((error) => {
          console.log(chalk.redBright(`\nFailed SQL Statement:\n`));
          console.log(table.statement);

          throw error;
        });
      },
      insert: (options = {}) => {
        const insert = sql.insert(options);
        return pool.query(insert.statement, insert.values).then((response) => {
          return response?.rows || [];
        }).catch((error) => {
          console.log(chalk.redBright(`\nFailed SQL Statement:\n`));
          console.log(insert.statement);
          console.log(`\n`);
          console.log(chalk.redBright(`\nFailed Values:\n`));
          console.log(insert.values);

          throw error;
        });
      },
      select: (options = {}) => {
        const select = sql.select(options);
        return pool.query(select.statement, select.values).then((response) => {
          return response?.rows || [];
        }).catch((error) => {
          console.log(chalk.redBright(`\nFailed SQL Statement:\n`));
          console.log(select.statement);
          console.log(`\n`);
          console.log(chalk.redBright(`\nFailed Values:\n`));
          console.log(select.where);

          throw error;
        });
      },
      update: (options = {}) => {
        const update = sql.update(options);
        return pool.query(update.statement, update.values).then((response) => {
          return response?.rows || [];
        }).catch((error) => {
          console.log(chalk.redBright(`\nFailed SQL Statement:\n`));
          console.log(update.statement);
          console.log(`\n`);
          console.log(chalk.redBright(`\nFailed Values:\n`));
          console.log(update.values);

          throw error;
        });
      },
    };
  } catch (exception) {
    console.warn(
      chalk.yellowBright(
        `\nFailed to connect to PostgreSQL. Please double-check connection settings and try again.\n\nError from PostgreSQL:\n\n${chalk.redBright(exception?.message)}`
      ),
    );
  }
};

export default connect_postgresql;
