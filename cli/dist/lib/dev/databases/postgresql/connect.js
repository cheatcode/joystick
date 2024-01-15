import os from "os";
import checkConnection from "./checkConnection.js";
import postgresql from "./index.js";
var connect_default = async (settings = {}, port = 2610) => {
  try {
    const hasConnection = settings.connection && Object.keys(settings.connection).length > 0;
    if (hasConnection) {
      await checkConnection(settings.connection, settings.options);
    }
    return {
      pid: !hasConnection ? await postgresql(port) : null,
      connection: hasConnection ? settings.connection : {
        hosts: [
          {
            hostname: "127.0.0.1",
            port
          }
        ],
        database: "app",
        // NOTE: PostgreSQL creates a default superuser based on the OS username.
        username: (os.userInfo() || {}).username || "",
        password: ""
      }
    };
  } catch (exception) {
    console.warn(exception);
  }
};
export {
  connect_default as default
};
