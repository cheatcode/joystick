import cluster from "cluster";
import os from "os";
var cluster_default = (callback = null) => {
  const cpus = os.cpus().length;
  if (cluster.isMaster) {
    for (let i = 0; i < cpus; i++) {
      const worker = cluster.fork();
      worker.on("message", (message) => {
        if (process.send) {
          process.send(message);
        }
      });
      process.on("message", (message) => {
        worker.send(message);
      });
    }
    cluster.on("exit", (worker) => {
      console.warn(`Worker ${worker.process.pid} died.`);
    });
  } else {
    callback();
  }
};
export {
  cluster_default as default
};
