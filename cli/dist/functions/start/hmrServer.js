import { WebSocketServer } from "ws";
import watch from "node-watch";
import fs from "fs";
var hmrServer_default = (() => {
  let fileWatchers = [];
  const websocketServer = new WebSocketServer({
    port: parseInt(process.env.PORT, 10) + 1,
    path: "/_joystick/hmr"
  });
  websocketServer.on("connection", function connection(websocketConnection) {
    websocketConnection.on("message", (message) => {
      const parsedMessage = JSON.parse(message);
      const isWatchlistMessage = parsedMessage && parsedMessage.type && parsedMessage.type === "HMR_WATCHLIST";
      if (isWatchlistMessage && parsedMessage.tags) {
        [
          ...parsedMessage.tags,
          "index.css",
          "index.html",
          "package.json",
          "settings.test.json",
          "settings.development.json",
          "settings.staging.json",
          "settings.production.json",
          "i18n"
        ].forEach((fileToWatch) => {
          if (fs.existsSync(`./${fileToWatch}`)) {
            const watcher = watch(`./.joystick/build/${fileToWatch}`, { recursive: true });
            fileWatchers.push(watcher);
            watcher.on("change", () => {
              websocketConnection.send(JSON.stringify({
                type: "FILE_CHANGE",
                path: fileToWatch
              }));
            });
          }
        });
      }
    });
  });
})();
export {
  hmrServer_default as default
};
