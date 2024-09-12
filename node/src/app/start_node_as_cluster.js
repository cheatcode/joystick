import cluster from "cluster";
import os from "os";

const setup_worker = (worker) => {
  worker.on("message", (message) => {
    if (message.type === 'websocket') {
      // Send WebSocket messages to the primary process
      if (process.send) {
        process.send(message);
      }
    } else {
      // Broadcast other types of messages to all workers
      for (const id in cluster.workers) {
        if (cluster.workers[id].id !== worker.id) {
          cluster.workers[id].send(message);
        }
      }
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
      if (message.type === 'websocket') {
        // Handle WebSocket messages in the primary process
        if (typeof global.handle_websocket_message === 'function') {
          global.handle_websocket_message(message);
        }
      } else {
        // Broadcast other types of messages to all workers
        for (const id in cluster.workers) {
          cluster.workers[id].send(message);
        }
      }
    });

    // Start the app in the primary process
    if (typeof start_app === 'function') {
      start_app();
    }
  } else if (cluster.isWorker) {
    console.log(`Worker ${process.pid} started`);

    // Start the app in the worker process
    if (typeof start_app === 'function') {
      start_app();
    }
  }
};

export default start_node_as_cluster;