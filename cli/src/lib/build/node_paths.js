import get_platform_safe_path from "./get_platform_safe_path.js";

const node_paths = [
  get_platform_safe_path("api/"),
  get_platform_safe_path("caches/"),
  get_platform_safe_path("cronJobs/"),
  get_platform_safe_path("cron_jobs/"),
  get_platform_safe_path("fixtures/"),
  get_platform_safe_path("indexes/"),
  get_platform_safe_path("lib/node"),
  get_platform_safe_path("queues/"),
  get_platform_safe_path("routes/"),
  get_platform_safe_path("tests/"),
  get_platform_safe_path("uploaders/"),
  get_platform_safe_path("websockets/"),
  get_platform_safe_path("workers/"),
  "index.server.js",
];

export default node_paths;
