import postgresql from 'pg';
import chalk from "chalk";
import os from 'os';
import fs from 'fs';
import generate_sql_from_object from '../generate_sql_from_object';

const { Pool } = postgresql;

export default async (settings = {}, databasePort = 2610) => {
  const connection = settings?.connection || {
    hosts: [
      { hostname: "127.0.0.1", port: databasePort },
    ],
    database: "app",
    // NOTE: PostgreSQL creates a default superuser based on the OS username.
    username: (os.userInfo() || {}).username || "",
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
      ...(settings?.options || {})
    };
    
    if (settings?.options?.ssl?.ca) {
      connection_config.ssl = {
        ca: fs.readFileSync(settings?.options?.ssl?.ca),
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
        const column = generate_sql_from_object.add_column(options);
        return pool.query(column.statement).then((response) => {
          return response?.rows || [];
        }).catch((error) => {
          console.log(chalk.redBright(`\nFailed SQL Statement:\n`));
          console.log(column.statement);

          throw error;
        });
      },
      create_table: (options = {}) => {
        const table = generate_sql_from_object.create_table(options);
        return pool.query(table.statement).then((response) => {
          return response?.rows || [];
        }).catch((error) => {
          console.log(chalk.redBright(`\nFailed SQL Statement:\n`));
          console.log(table.statement);

          throw error;
        });
      },
      insert: (options = {}) => {
        const insert = generate_sql_from_object.insert(options);
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
        const select = generate_sql_from_object.select(options);
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
        const update = generate_sql_from_object.update(options);
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
