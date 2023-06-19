import fs from "fs";
import { WebSocketServer } from "ws";
import generateId from "./generateId";
var hmrServer_default = (() => {
  const websocketServer = new WebSocketServer({
    port: parseInt(process.env.PORT, 10) + 1,
    path: "/_joystick/hmr"
  });
  process.on("message", (message) => {
    if (typeof process.HMR_CONNECTIONS === "object") {
      const connections = Object.values(process.HMR_CONNECTIONS);
      for (let i = 0; i < connections?.length; i += 1) {
        const connection = connections[i];
        if (connection?.connection?.send) {
          connection.connection.send(
            JSON.stringify({
              type: "FILE_CHANGE",
              files: connection?.watchlist?.reduce((files = {}, file = "") => {
                files[file] = fs.readFileSync(`./.joystick/build/${file}`, "utf-8");
                return files;
              }, {})
            })
          );
        }
      }
    }
  });
  websocketServer.on("connection", function connection(websocketConnection) {
    const connectionId = generateId();
    process.HMR_CONNECTIONS = {
      ...process.HMR_CONNECTIONS || {},
      [connectionId]: {
        connection: websocketConnection,
        watchlist: []
      }
    };
    websocketConnection.on("message", (message) => {
      const parsedMessage = JSON.parse(message);
      if (parsedMessage?.type === "HMR_WATCHLIST") {
        process.HMR_CONNECTIONS[connectionId]?.watchlist?.push(...parsedMessage?.tags || []);
      }
    });
    websocketConnection.on("close", () => {
      if (process.HMR_CONNECTIONS[connectionId]) {
        delete process.HMR_CONNECTIONS[connectionId];
      }
    });
  });
})();
export {
  hmrServer_default as default
};
