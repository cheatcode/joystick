import net from "net";

export default (port) => {
  return new Promise((resolve, reject) => {
    const testServer = net.createServer();

    testServer
      .once("error", function (err) {
        if (err.code != "EADDRINUSE") return callback(err);
        resolve(false);
      })
      .once("listening", function () {
        testServer
          .once("close", function () {
            resolve(true);
          })
          .close();
      })
      .listen(port);
  });
};
