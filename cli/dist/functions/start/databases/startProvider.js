import mongodb from "./mongodb/index.js";
import checkMongoDBConnection from "./mongodb/checkConnection.js";
import checkPostgreSQLConnection from "./postgresql/checkConnection.js";
import postgresql from "./postgresql/index.js";
var startProvider_default = async (provider = "", settings = {}) => {
  if (provider === "mongodb") {
    process.loader.text("Starting MongoDB...");
    const hasConnection = settings.connection && Object.keys(settings.connection).length > 0;
    let db = null;
    if (hasConnection) {
      await checkMongoDBConnection(settings.connection);
    }
    if (!hasConnection) {
      db = await mongodb(settings);
    }
    const defaultConnection = {
      hosts: [
        {
          hostname: "127.0.0.1",
          port: parseInt(process.env.PORT, 10) + 1
        }
      ],
      database: "app",
      username: "",
      password: ""
    };
    const instance = {
      pid: db,
      connection: hasConnection ? settings.connection : defaultConnection,
      settings
    };
    process.databases = process.databases ? {
      ...process.databases,
      mongodb: instance
    } : {
      mongodb: instance
    };
  }
  if (provider === "postgresql") {
    process.loader.text("Starting PostgreSQL...");
    const hasConnection = settings.connection && Object.keys(settings.connection).length > 0;
    let db = null;
    if (hasConnection) {
      await checkPostgreSQLConnection(settings.connection);
    }
    if (!hasConnection) {
      db = await postgresql(settings);
    }
    const defaultConnection = {
      hosts: [
        {
          hostname: "127.0.0.1",
          port: parseInt(process.env.PORT, 10) + 1
        }
      ],
      database: "app",
      username: "",
      password: ""
    };
    const instance = {
      pid: db,
      connection: hasConnection ? settings.connection : defaultConnection,
      settings
    };
    console.log(instance);
    process.databases = process.databases ? {
      ...process.databases,
      postgresql: instance
    } : {
      postgresql: instance
    };
  }
  return Promise.resolve();
};
export {
  startProvider_default as default
};
