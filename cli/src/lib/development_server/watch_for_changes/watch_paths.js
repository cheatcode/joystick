import copy_paths from "../../build/copy_paths.js";

const watch_paths = [
  { path: "api" },
  { path: "caches" },
  { path: "cronJobs" },
  { path: "cron_jobs" },
  { path: "email" },
  { path: "fixtures" },
  { path: "indexes" },
  { path: "lib" },
  { path: "queues" },
  { path: "routes" },
  { path: "tests" },
  { path: "ui" },
  { path: "uploaders" },
  { path: "websockets" },
  { path: "workers" },
  { path: "index.client.js" },
  { path: "index.server.js" },
  ...copy_paths,
];

export default watch_paths;
