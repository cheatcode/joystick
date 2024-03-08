import os from 'os';
import check_connection from "./check_connection.js";
import postgresql from "./index.js";

const connect = async (settings = {}, port = 2610) => {
  try {
    const has_connection = settings.connection && Object.keys(settings.connection).length > 0;

    if (has_connection) {
      await check_connection(settings.connection, settings.options);
    }

    return {
      pid: !has_connection ? await postgresql(port) : null,
      connection: has_connection ? settings.connection : {
        hosts: [
          {
            hostname: "127.0.0.1",
            port,
          },
        ],
        database: "app",
        // NOTE: PostgreSQL creates a default superuser based on the OS username.
        username: (os.userInfo() || {}).username || "",
        password: "",
      },
    };
  } catch (exception) {
    console.warn(exception);
  }
};

export default connect;
