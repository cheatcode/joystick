import os from "os";
import checkConnection from "./checkConnection.js";
import postgresql from "./index.js";
var connect_default = async (settings = {}, port = 2610) => {
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
      username: (os.userInfo() || {}).username || "",
      password: ""
    }
  };
};
export {
  connect_default as default
};
