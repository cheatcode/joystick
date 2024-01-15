import fs from "fs";
import { WebSocketServer } from "ws";
import generateId from "../generateId.js";
var hmrServer_default = (() => {
  const websocketServer = new WebSocketServer({
    port: parseInt(process.env.PORT, 10) + 1,
    path: "/_joystick/hmr"
  });
  process.on("message", (message) => {
    const parsedMessage = JSON.parse(message);
    if (typeof process.HMR_CONNECTIONS === "object" && parsedMessage?.type === "FILE_CHANGE") {
      const connections = Object.values(process.HMR_CONNECTIONS);
      for (let i = 0; i < connections?.length; i += 1) {
        const connection = connections[i];
        if (connection?.connection?.send) {
          connection.connection.send(
            JSON.stringify({
              type: "FILE_CHANGE",
              settings: {
                global: parsedMessage?.settings?.global,
                public: parsedMessage?.settings?.public
              },
              indexHTMLChanged: parsedMessage?.indexHTMLChanged
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
    if (Object.keys(process.HMR_CONNECTIONS || {})?.length > 0) {
      process.send({ type: "HAS_HMR_CONNECTIONS" });
    }
    websocketConnection.on("message", (message) => {
      const parsedMessage = JSON.parse(message);
      if (parsedMessage?.type === "HMR_UPDATE_COMPLETE") {
        process.send({ type: "HMR_UPDATE_COMPLETED" });
      }
      if (parsedMessage?.type === "HMR_WATCHLIST") {
        process.HMR_CONNECTIONS[connectionId]?.watchlist?.push(
          ...parsedMessage?.tags || []
        );
      }
    });
    websocketConnection.on("close", () => {
      if (process.HMR_CONNECTIONS[connectionId]) {
        delete process.HMR_CONNECTIONS[connectionId];
        if (Object.keys(process.HMR_CONNECTIONS || {})?.length === 0) {
          process.send({ type: "HAS_NO_HMR_CONNECTIONS" });
        }
      }
    });
  });
  return true;
})();
export {
  hmrServer_default as default
};
