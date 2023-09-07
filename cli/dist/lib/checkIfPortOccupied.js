import net from "net";
const resetClient = (client = {}) => {
  client.end();
  client.destroy();
  client.unref();
};
var checkIfPortOccupied_default = (port = 2600) => {
  return new Promise((resolve) => {
    const client = new net.Socket();
    client.once("connect", () => {
      resetClient(client);
      resolve(true);
    });
    client.once("error", () => {
      resetClient(client);
      resolve(false);
    });
    client.connect({
      port,
      host: "127.0.0.1"
    }, function() {
    });
  });
};
export {
  checkIfPortOccupied_default as default
};
