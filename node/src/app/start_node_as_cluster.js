import cluster from "cluster";
import os from "os";

const start_node_as_cluster = (callback = null) => {
  const cpus = os.cpus().length;

  if (cluster.isPrimary) {
    for (let i = 0; i < cpus; i++) {
      const worker = cluster.fork(process.env);

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

export default start_node_as_cluster;
