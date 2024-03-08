import get_platform_safe_path from "../get_platform_safe_path.js";

const browser_paths = [
  get_platform_safe_path("email/"),
  get_platform_safe_path("lib/"),
  get_platform_safe_path("lib/browser"),
  get_platform_safe_path("ui/"),
  "index.client.js",
];

export default browser_paths;
