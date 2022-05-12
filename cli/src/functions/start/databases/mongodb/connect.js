import checkConnection from "./checkConnection.js";
import mongodb from "./index.js";

export default async (settings = {}, port = 2610) => {
  const hasConnection = settings.connection && Object.keys(settings.connection).length > 0;

  if (hasConnection) {
    await checkConnection(settings.connection, settings.options);
  }

  return {
    pid: !hasConnection ? await mongodb(port) : null,
    connection: hasConnection ? settings.connection : {
      hosts: [
        {
          hostname: "127.0.0.1",
          port,
        },
      ],
      database: "app",
      username: "",
      password: "",
    },
  };
};