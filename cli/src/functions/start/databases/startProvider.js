import mongodb from "./mongodb/index.js";
import checkMongoDBConnection from "./mongodb/checkConnection.js";

export default async (provider = "", settings = {}) => {
  if (provider === "mongodb") {
    process.loader.text("Starting MongoDB...");

    const hasConnection =
      settings.connection && Object.keys(settings.connection).length > 0;
    let databaseProcessId = null;

    if (hasConnection) {
      await checkMongoDBConnection(settings.connection);
    }

    if (!hasConnection) {
      databaseProcessId = await mongodb(settings);
    }

    const defaultConnection = {
      hosts: [
        {
          hostname: "127.0.0.1",
          port: parseInt(process.env.PORT, 10) + 1,
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

  return Promise.resolve();
};
