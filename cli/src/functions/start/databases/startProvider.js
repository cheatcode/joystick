import os from 'os';
import mongodb from "./mongodb/index.js";
import checkMongoDBConnection from "./mongodb/checkConnection.js";
import checkPostgreSQLConnection from './postgresql/checkConnection.js';
import postgresql from './postgresql/index.js';

export default async (provider = "", settings = {}, databasePort = 2610) => {
  if (provider === "mongodb") {
    process.loader.text("Starting MongoDB...");

    const hasConnection =
      settings.connection && Object.keys(settings.connection).length > 0;
    let databaseProcessId = null;

    if (hasConnection) {
      await checkMongoDBConnection(settings.connection, settings.options);
    }

    if (!hasConnection) {
      databaseProcessId = await mongodb(databasePort);
    }

    const defaultConnection = {
      hosts: [
        {
          hostname: "127.0.0.1",
          port: databasePort,
        },
      ],
      database: "app",
      username: "",
      password: "",
    };

    const instance = {
      pid: databaseProcessId,
      connection: hasConnection ? settings.connection : defaultConnection,
      settings,
    };

    process.databases = process.databases
      ? {
          ...process.databases,
          mongodb: instance,
        }
      : {
          mongodb: instance,
        };
  }

  if (provider === "postgresql") {
    process.loader.text("Starting PostgreSQL...");

    const hasConnection =
      settings.connection && Object.keys(settings.connection).length > 0;
    let db = null;

    if (hasConnection) {
      await checkPostgreSQLConnection(settings.connection);
    }

    if (!hasConnection) {
      db = await postgresql(databasePort);
    }

    const defaultConnection = {
      hosts: [
        {
          hostname: "127.0.0.1",
          port: databasePort,
        },
      ],
      database: "app",
      // NOTE: PostgreSQL creates a default superuser based on the OS username.
      username: (os.userInfo() || {}).username || "",
      password: "",
    };

    const instance = {
      pid: db,
      connection: hasConnection ? settings.connection : defaultConnection,
      settings,
    };
    
    process.databases = process.databases
      ? {
          ...process.databases,
          postgresql: instance,
        }
      : {
          postgresql: instance,
        };
  }

  return Promise.resolve();
};
