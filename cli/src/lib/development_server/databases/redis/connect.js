import check_connection from "./check_connection.js";
import redis from "./index.js";

const connect = async (settings = {}, port = 2610) => {
  const has_connection = settings.connection && Object.keys(settings.connection).length > 0;

  if (has_connection) {
    await check_connection(settings.connection, settings.options);
  }

  return {
    pid: !has_connection ? await redis(port) : null,
    connection: has_connection ? settings.connection : {
      hosts: [
        {
          hostname: "127.0.0.1",
          port,
        },
      ],
      database: 0,
      username: "",
      password: "",
    },
  };
};

export default connect;
