import cluster from "cluster";
import os from "os";

const setup_worker = (worker) => {
  worker.on("message", (message) => {
    // Broadcast message to all workers
    for (const id in cluster.workers) {
      if (cluster.workers[id].id !== worker.id) {
        cluster.workers[id].send(message);
      }
    }
    // Also send to primary if it has a send method
    if (process.send) {
      process.send(message);
    }
  });
};

const start_node_as_cluster = (start_app = null) => {
  const cpus = os.cpus().length;

  if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);

    // Fork workers
    for (let i = 1; i < cpus; i++) {
      const worker = cluster.fork(process.env);
      setup_worker(worker);
    }

    cluster.on("exit", (worker, code, signal) => {
      console.warn(`Worker ${worker.process.pid} died. Restarting...`);
      const new_worker = cluster.fork(process.env);
      setup_worker(new_worker);
    });

    // Handle messages received by the primary
    process.on("message", (message) => {
      // Broadcast to all workers
      for (const id in cluster.workers) {
        cluster.workers[id].send(message);
      }
    });

    // Start the app in the primary process
    if (typeof start_app === 'function') {
      start_app();
    }
  }

  if (cluster.isWorker) {
    console.log(`Worker ${process.pid} started`);
  }
};

export default start_node_as_cluster;