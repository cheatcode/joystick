import get_platform_safe_path from "./get_platform_safe_path.js";

const browser_path_exclusions = [
  get_platform_safe_path("lib/node"),
  get_platform_safe_path("tests/"),
];

export default browser_path_exclusions;
